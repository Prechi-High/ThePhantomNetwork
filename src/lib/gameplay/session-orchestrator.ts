import { createAdminClient } from "@/lib/supabase/admin";
import { classifyPhase1, classifyPercentileElimination } from "@/lib/gameplay/elimination";
import type { PhaseConfig } from "@/types/gameplay";
import { redisSet, redisGet, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { publishPhaseChange } from "@/lib/gameplay/realtime-events";
import {
  PHASE_DURATIONS_MS,
  PHASE_STATE_TTL_SECONDS,
  TOTAL_SESSION_DURATION_MS,
} from "@/lib/gameplay/phase-timing";

export async function applyInventoryAtSessionStart(sessionId: string) {
  const admin = createAdminClient();

  const { data: registrations } = await admin
    .from("session_registrations")
    .select("user_id")
    .eq("session_id", sessionId);

  const { data: subSessions } = await admin
    .from("sub_sessions")
    .select("id")
    .eq("session_id", sessionId);

  for (const reg of registrations ?? []) {
    const { data: inv } = await admin
      .from("player_inventory")
      .select("*")
      .eq("user_id", reg.user_id)
      .eq("session_id", sessionId)
      .single();

    if (!inv) continue;

    for (const sub of subSessions ?? []) {
      const { data: player } = await admin
        .from("sub_session_players")
        .select("id")
        .eq("sub_session_id", sub.id)
        .eq("user_id", reg.user_id)
        .single();

      if (player) {
        await admin
          .from("sub_session_players")
          .update({
            shield_count: inv.shield_count,
            insurance_active: inv.insurance_count > 0,
            steal_boost_active: inv.steal_boost_active,
            shield_boost_active: inv.shield_boost_active,
          })
          .eq("id", player.id);
      }
    }
  }
}

export async function initializeSubSessionState(
  subSessionId: string,
  phaseConfig: PhaseConfig
) {
  const phaseStartedAt = Date.now();
  const phaseEndsAt = phaseStartedAt + PHASE_DURATIONS_MS[0];

  await redisSet(
    redisKeys.subState(subSessionId),
    {
      phase: 1,
      round: 1,
      phaseStartedAt,
      phaseEndsAt,
      phaseConfig,
    },
    PHASE_STATE_TTL_SECONDS
  );

  await publishPhaseChange(subSessionId, {
    phase: 1,
    round: 1,
    phaseStartedAt,
    phaseEndsAt,
  });
}

export async function runPhase1Elimination(
  subSessionId: string,
  phaseConfig: PhaseConfig
) {
  const admin = createAdminClient();
  const p1 = phaseConfig.phase1;

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId);

  for (const player of players ?? []) {
    const tokens = Number(player.session_tokens);
    const category = classifyPhase1(tokens, p1);

    if (category === "passed") continue;
    if (category === "revivable") {
      await admin
        .from("sub_session_players")
        .update({ is_revivable: true, is_eliminated: true })
        .eq("id", player.id);
    } else if (player.insurance_active && tokens >= p1.revivable_min && tokens < p1.target) {
      await admin
        .from("sub_session_players")
        .update({ insurance_active: false })
        .eq("id", player.id);
    } else {
      await admin
        .from("sub_session_players")
        .update({ is_eliminated: true, elimination_phase: 1 })
        .eq("id", player.id);
    }
  }
}

export async function runPercentileElimination(
  subSessionId: string,
  phase: number,
  eliminateBottomPct: number
) {
  const admin = createAdminClient();

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("is_eliminated", false);

  const active = (players ?? []).map((p) => ({
    userId: p.user_id,
    tokens: Number(p.session_tokens),
  }));

  const { survivors, eliminated } = classifyPercentileElimination(
    active,
    eliminateBottomPct
  );

  for (const userId of eliminated) {
    await admin
      .from("sub_session_players")
      .update({ is_eliminated: true, elimination_phase: phase })
      .eq("sub_session_id", subSessionId)
      .eq("user_id", userId);
  }

  return { survivors: survivors.length, eliminated: eliminated.length };
}

export async function advanceSubSessionPhase(subSessionId: string) {
  const admin = createAdminClient();
  const state = await redisGet<{
    phase: number;
    phaseConfig: PhaseConfig;
    phaseEndsAt: number;
  }>(redisKeys.subState(subSessionId));

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("*, sessions(phase_config, economy_config, entry_fee_cents, platform_fee_pct, id)")
    .eq("id", subSessionId)
    .single();

  if (!subSession || subSession.status === "completed") return { done: true };

  const phaseConfig =
    state?.phaseConfig ??
    (subSession.sessions as { phase_config: PhaseConfig }).phase_config;
  const currentPhase = subSession.current_phase ?? 1;

  if (currentPhase === 1) {
    await runPhase1Elimination(subSessionId, phaseConfig);
  } else if (currentPhase === 2) {
    await runPercentileElimination(subSessionId, 2, phaseConfig.phase2.eliminate_bottom_pct);
  } else if (currentPhase === 3) {
    await runPercentileElimination(subSessionId, 3, phaseConfig.phase3.eliminate_bottom_pct);
  } else if (currentPhase === 4) {
    await finalizeSubSession(subSessionId);
    return { done: true };
  }

  const nextPhase = currentPhase + 1;
  if (nextPhase > 4) {
    await finalizeSubSession(subSessionId);
    return { done: true };
  }

  await admin
    .from("sub_sessions")
    .update({
      current_phase: nextPhase,
      phase_started_at: new Date().toISOString(),
    })
    .eq("id", subSessionId);

  const phaseStartedAt = Date.now();
  const phaseEndsAt = phaseStartedAt + PHASE_DURATIONS_MS[nextPhase - 1];

  await redisSet(
    redisKeys.subState(subSessionId),
    {
      phase: nextPhase,
      round: 1,
      phaseStartedAt,
      phaseEndsAt,
      phaseConfig,
    },
    PHASE_STATE_TTL_SECONDS
  );

  await publishPhaseChange(subSessionId, {
    phase: nextPhase,
    round: 1,
    phaseStartedAt,
    phaseEndsAt,
  });

  return { done: false, phase: nextPhase };
}

async function finalizeSubSession(subSessionId: string) {
  const admin = createAdminClient();

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("is_eliminated", false)
    .order("session_tokens", { ascending: false });

  const ranked = (players ?? []).map((p, i) => ({
    ...p,
    rank: i + 1,
  }));

  for (const p of ranked) {
    await admin
      .from("sub_session_players")
      .update({
        final_tokens: p.session_tokens,
        final_rank: p.rank,
      })
      .eq("id", p.id);
  }

  const winner = ranked[0];
  await admin
    .from("sub_sessions")
    .update({
      winner_id: winner?.user_id ?? null,
      status: "completed",
    })
    .eq("id", subSessionId);

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ subSessionId }),
    });
  } catch {
    // Payout failure should not block session completion
  }

  for (const p of ranked) {
    const { data: sub } = await admin
      .from("sub_sessions")
      .select("session_id")
      .eq("id", subSessionId)
      .single();

    const teammates = ranked
      .filter((t) => t.squad_id && t.squad_id === p.squad_id && t.user_id !== p.user_id)
      .map((t) => ({ userId: t.user_id }));

    await admin.from("session_history").insert({
      session_id: sub!.session_id,
      sub_session_id: subSessionId,
      user_id: p.user_id,
      final_rank: p.rank,
      final_tokens: p.session_tokens,
      teammates,
      rivals: [],
    });
  }
}

export async function checkAndAdvanceDuePhases() {
  const admin = createAdminClient();
  const { data: activeSubs } = await admin
    .from("sub_sessions")
    .select("id, current_phase, phase_started_at, sessions(phase_config)")
    .eq("status", "active");

  const now = Date.now();
  const advanced: string[] = [];

  for (const sub of activeSubs ?? []) {
    const state = await redisGet<{ phaseEndsAt: number }>(redisKeys.subState(sub.id));
    const phaseStarted = sub.phase_started_at ? new Date(sub.phase_started_at).getTime() : 0;
    const phaseIdx = (sub.current_phase ?? 1) - 1;
    const duration = PHASE_DURATIONS_MS[phaseIdx] ?? 6 * 60 * 1000;
    const endsAt = state?.phaseEndsAt ?? phaseStarted + duration;

    if (now >= endsAt) {
      await advanceSubSessionPhase(sub.id);
      advanced.push(sub.id);
    }
  }

  return advanced;
}

/** Force-complete sub-sessions that exceeded total session duration (safety net). */
export async function forceCompleteStaleSessions() {
  const admin = createAdminClient();
  const now = Date.now();
  const completedSessionIds: string[] = [];

  const { data: activeSessions } = await admin
    .from("sessions")
    .select("id, starts_at")
    .eq("status", "active");

  for (const session of activeSessions ?? []) {
    const sessionStart = new Date(session.starts_at).getTime();
    if (now < sessionStart + TOTAL_SESSION_DURATION_MS) continue;

    const { data: subs } = await admin
      .from("sub_sessions")
      .select("id")
      .eq("session_id", session.id)
      .eq("status", "active");

    for (const sub of subs ?? []) {
      await finalizeSubSession(sub.id);
    }

    await admin.from("sessions").update({ status: "completed" }).eq("id", session.id);
    completedSessionIds.push(session.id);
  }

  return completedSessionIds;
}
