import { createAdminClient } from "@/lib/supabase/admin";
import { classifyTargetElimination, classifyPercentileElimination } from "@/lib/gameplay/elimination";
import type { PhaseConfig, TargetEliminationConfig, PercentageEliminationConfig } from "@/types/gameplay";
import { redisSet, redisGet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { publishPhaseChange } from "@/lib/gameplay/realtime-events";
import {
  getPhaseEntry,
  getPhaseDurationMs,
  getPhaseStateTTLSeconds,
  getTotalSessionDurationMs,
  formatPhaseAnnouncement,
  LEGACY_PHASE_DURATIONS_MS,
} from "@/lib/gameplay/phase-timing";
import { publishLiveFeed } from "@/lib/api/rate-limit";

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
  const initialPhaseEntry = getPhaseEntry(phaseConfig, 1);
  const phaseEndsAt = phaseStartedAt + getPhaseDurationMs(initialPhaseEntry);
  const ttlSeconds = getPhaseStateTTLSeconds(phaseConfig);

  await redisSet(
    redisKeys.subState(subSessionId),
    {
      phase: 1,
      round: 1,
      phaseStartedAt,
      phaseEndsAt,
      phaseConfig,
    },
    ttlSeconds
  );

  await publishPhaseChange(subSessionId, {
    phase: 1,
    round: 1,
    phaseStartedAt,
    phaseEndsAt,
  });

  if (initialPhaseEntry) {
    const { data: sub } = await createAdminClient()
      .from("sub_sessions")
      .select("session_id")
      .eq("id", subSessionId)
      .single();
    if (sub) {
      await publishLiveFeed(
        "phase_start",
        formatPhaseAnnouncement(initialPhaseEntry),
        { sessionId: sub.session_id, subSessionId }
      );
    }
  }
}

export async function runTargetElimination(
  subSessionId: string,
  phaseNumber: number,
  config: TargetEliminationConfig
) {
  const admin = createAdminClient();

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId);

  for (const player of players ?? []) {
    const tokens = Number(player.session_tokens);
    const category = classifyTargetElimination(tokens, config);

    if (category === "passed") continue;
    if (category === "revivable") {
      await admin
        .from("sub_session_players")
        .update({ is_revivable: true, is_eliminated: true })
        .eq("id", player.id);
    } else if (player.insurance_active && tokens >= config.revivable_min && tokens < config.target) {
      await admin
        .from("sub_session_players")
        .update({ insurance_active: false })
        .eq("id", player.id);
    } else {
      await admin
        .from("sub_session_players")
        .update({ is_eliminated: true, elimination_phase: phaseNumber })
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
  const currentPhaseEntry = getPhaseEntry(phaseConfig, currentPhase);

  // Run elimination for current phase if needed
  if (currentPhaseEntry) {
    if (currentPhaseEntry.elimination_rule === "target") {
      await runTargetElimination(subSessionId, currentPhase, currentPhaseEntry.config as TargetEliminationConfig);
    } else if (currentPhaseEntry.elimination_rule === "percentage") {
      const config = currentPhaseEntry.config as PercentageEliminationConfig;
      await runPercentileElimination(subSessionId, currentPhase, config.eliminate_bottom_pct);
    }
  }

  // Check if this is the final phase (check if there's a next phase in config)
  const nextPhase = currentPhase + 1;
  const nextPhaseEntry = getPhaseEntry(phaseConfig, nextPhase);

  if (!nextPhaseEntry) {
    await finalizeSubSession(subSessionId);
    return { done: true };
  }

  // Advance to next phase
  await admin
    .from("sub_sessions")
    .update({
      current_phase: nextPhase,
      phase_started_at: new Date().toISOString(),
    })
    .eq("id", subSessionId);

  const phaseStartedAt = Date.now();
  const phaseEndsAt = phaseStartedAt + getPhaseDurationMs(nextPhaseEntry);
  const ttlSeconds = getPhaseStateTTLSeconds(phaseConfig);

  await redisSet(
    redisKeys.subState(subSessionId),
    {
      phase: nextPhase,
      round: 1,
      phaseStartedAt,
      phaseEndsAt,
      phaseConfig,
    },
    ttlSeconds
  );

  await publishPhaseChange(subSessionId, {
    phase: nextPhase,
    round: 1,
    phaseStartedAt,
    phaseEndsAt,
  });

  // Publish phase start announcement
  const { data: sub } = await admin
    .from("sub_sessions")
    .select("session_id")
    .eq("id", subSessionId)
    .single();
  if (sub) {
    await publishLiveFeed(
      "phase_start",
      formatPhaseAnnouncement(nextPhaseEntry),
      { sessionId: sub.session_id, subSessionId }
    );
  }

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
    const state = await redisGet<{ phaseEndsAt: number; phaseConfig?: PhaseConfig }>(
      redisKeys.subState(sub.id)
    );
    const phaseStarted = sub.phase_started_at ? new Date(sub.phase_started_at).getTime() : 0;
    const currentPhase = sub.current_phase ?? 1;
    const phaseConfig = state?.phaseConfig ??
      (sub.sessions as { phase_config?: PhaseConfig }).phase_config;
    const phaseEntry = phaseConfig ? getPhaseEntry(phaseConfig, currentPhase) : undefined;
    const duration = phaseEntry
      ? getPhaseDurationMs(phaseEntry)
      : LEGACY_PHASE_DURATIONS_MS[Math.max(0, currentPhase - 1)] ?? 6 * 60 * 1000;
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
    .select("id, starts_at, phase_config")
    .eq("status", "active");

  for (const session of activeSessions ?? []) {
    const sessionStart = new Date(session.starts_at).getTime();
    const phaseConfig = session.phase_config as PhaseConfig | undefined;
    const totalDuration = phaseConfig
      ? getTotalSessionDurationMs(phaseConfig)
      : LEGACY_PHASE_DURATIONS_MS.reduce((a, b) => a + b, 0);

    if (now < sessionStart + totalDuration) continue;

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
