import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { rollSpinOutcome, applySpinTokens, getTokenDelta, type ProvablyFairSpin } from "@/lib/gameplay/spin";
import { redisPublish, redisGet, redisSet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { checkRateLimit, acquireSpinLock } from "@/lib/api/rate-limit";
import { SPIN_DURATION_MS } from "@/types/gameplay";
import { PHASE_STATE_TTL_SECONDS, getPhaseDurationMs, getPhaseEntry, LEGACY_PHASE_DURATIONS_MS, isPhaseTimerExpired } from "@/lib/gameplay/phase-timing";
import type { PhaseConfig } from "@/types/gameplay";
import { getTargetAngle } from "@/lib/gameplay/wheel-config";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId } = await request.json();
  const rl = await checkRateLimit(`spin:${user!.id}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const lockKey = redisKeys.spinLock(subSessionId, user!.id);
  const locked = await acquireSpinLock(lockKey, SPIN_DURATION_MS / 1000);
  if (!locked) {
    return NextResponse.json({ error: "Spin in progress or on cooldown" }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data: player } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!player || player.is_eliminated) {
    return NextResponse.json({ error: "Cannot spin" }, { status: 400 });
  }

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("id, status, current_phase, phase_started_at, sessions(phase_config)")
    .eq("id", subSessionId)
    .single();

  if (!subSession || subSession.status !== "active") {
    return NextResponse.json({ error: "Session ended" }, { status: 400 });
  }

  const redisState = await redisGet<{ phaseEndsAt?: number; phaseConfig?: PhaseConfig }>(
    redisKeys.subState(subSessionId)
  );
  const currentPhase = subSession.current_phase ?? 1;
  const phaseConfig =
    redisState?.phaseConfig ??
    (subSession.sessions as { phase_config?: PhaseConfig }).phase_config;
  const phaseEntry = phaseConfig ? getPhaseEntry(phaseConfig, currentPhase) : undefined;
  const duration = phaseEntry
    ? getPhaseDurationMs(phaseEntry)
    : LEGACY_PHASE_DURATIONS_MS[Math.max(0, currentPhase - 1)] ?? 6 * 60 * 1000;
  const phaseStarted = subSession.phase_started_at
    ? new Date(subSession.phase_started_at).getTime()
    : 0;
  const endsAt = redisState?.phaseEndsAt ?? (phaseStarted ? phaseStarted + duration : null);

  if (isPhaseTimerExpired(endsAt)) {
    return NextResponse.json({ error: "Phase ended" }, { status: 400 });
  }

  const fairSpin: ProvablyFairSpin = rollSpinOutcome();
  const targetAngle = getTargetAngle(fairSpin.winningIndex);
  fairSpin.targetAngle = targetAngle;

  let newTokens = Number(player.session_tokens);

  if (fairSpin.winningSector !== "STEAL") {
    newTokens = applySpinTokens(newTokens, fairSpin.winningSector);
    await admin
      .from("sub_session_players")
      .update({ session_tokens: newTokens })
      .eq("id", player.id);

    await admin.from("session_events").insert({
      sub_session_id: subSessionId,
      user_id: user!.id,
      event_type: "spin",
      payload: {
        outcome: fairSpin.winningSector,
        spinId: fairSpin.spinId,
        hashedServerSeed: fairSpin.hashedServerSeed,
        clientSeed: fairSpin.clientSeed,
        nonce: fairSpin.nonce,
        randomFloat: fairSpin.randomFloat,
        winningIndex: fairSpin.winningIndex,
      },
    });
  }

  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: fairSpin.winningSector === "STEAL" ? "steal_spin" : "spin_result",
    userId: user!.id,
    outcome: fairSpin.winningSector,
    tokens: newTokens,
    spinId: fairSpin.spinId,
    hashedServerSeed: fairSpin.hashedServerSeed,
    clientSeed: fairSpin.clientSeed,
    nonce: fairSpin.nonce,
    randomFloat: fairSpin.randomFloat,
    winningIndex: fairSpin.winningIndex,
    targetAngle: targetAngle,
  });

  // Publish a global event to refresh state for all clients (for leaderboard/squad tokens)
  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "tokens_updated",
  });

  const state = await redisGet<{ round: number; phase: number }>(redisKeys.subState(subSessionId));
  if (state) {
    const newRound = Math.min((state.round ?? 1) + 1, 3);
    await redisSet(redisKeys.subState(subSessionId), { ...state, round: newRound }, PHASE_STATE_TTL_SECONDS);
    await redisPublish(redisKeys.realtimeChannel(subSessionId), {
      type: "round_update",
      round: newRound,
    });
  }

  const tokenDelta = getTokenDelta(fairSpin.winningSector);

  return NextResponse.json({
    outcome: fairSpin.winningSector,
    tokens: newTokens,
    tokenDelta,
    requiresTargetSelection: fairSpin.winningSector === "STEAL",
    spinId: fairSpin.spinId,
    hashedServerSeed: fairSpin.hashedServerSeed,
    clientSeed: fairSpin.clientSeed,
    nonce: fairSpin.nonce,
    randomFloat: fairSpin.randomFloat,
    winningIndex: fairSpin.winningIndex,
    targetAngle: targetAngle,
  });
}
