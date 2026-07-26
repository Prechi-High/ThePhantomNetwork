import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { acquireSpinLock } from "@/lib/api/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceSubSessionPhase } from "@/lib/gameplay/session-orchestrator";
import {
  getPhaseDurationMs,
  getPhaseEntry,
  LEGACY_PHASE_DURATIONS_MS,
} from "@/lib/gameplay/phase-timing";
import { redisGet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { PhaseConfig } from "@/types/gameplay";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId } = await request.json();
  if (!subSessionId) {
    return NextResponse.json({ error: "subSessionId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: player } = await admin
    .from("sub_session_players")
    .select("id")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("id, status, current_phase, phase_started_at, sessions(phase_config)")
    .eq("id", subSessionId)
    .single();

  if (!subSession || subSession.status !== "active") {
    return NextResponse.json({ advanced: false, reason: "session_inactive" });
  }

  const state = await redisGet<{
    phaseEndsAt?: number;
    phaseConfig?: PhaseConfig;
  }>(redisKeys.subState(subSessionId));

  const currentPhase = subSession.current_phase ?? 1;
  const phaseConfig =
    state?.phaseConfig ??
    (subSession.sessions as { phase_config?: PhaseConfig }).phase_config;
  const phaseEntry = phaseConfig ? getPhaseEntry(phaseConfig, currentPhase) : undefined;
  const duration = phaseEntry
    ? getPhaseDurationMs(phaseEntry)
    : LEGACY_PHASE_DURATIONS_MS[Math.max(0, currentPhase - 1)] ?? 6 * 60 * 1000;
  const phaseStarted = subSession.phase_started_at
    ? new Date(subSession.phase_started_at).getTime()
    : 0;
  const endsAt = state?.phaseEndsAt ?? phaseStarted + duration;

  if (Date.now() < endsAt) {
    return NextResponse.json({
      advanced: false,
      reason: "not_due",
      phase: currentPhase,
      phaseEndsAt: endsAt,
    });
  }

  const lockKey = redisKeys.phaseAdvanceLock(subSessionId);
  const locked = await acquireSpinLock(lockKey, 10);
  if (!locked) {
    return NextResponse.json({
      advanced: false,
      reason: "advance_in_progress",
      phase: currentPhase,
    });
  }

  const result = await advanceSubSessionPhase(subSessionId);

  if (result.done) {
    const { data: finalizedSub } = await admin
      .from("sub_sessions")
      .select("status, session_id, sessions(status)")
      .eq("id", subSessionId)
      .single();

    const parentStatus = (finalizedSub?.sessions as { status?: string } | null)?.status;

    return NextResponse.json({
      advanced: true,
      done: true,
      phase: currentPhase,
      subSessionStatus: finalizedSub?.status ?? "completed",
      sessionStatus: parentStatus ?? "completed",
    });
  }

  const updatedState = await redisGet<{ phase?: number; phaseEndsAt?: number }>(
    redisKeys.subState(subSessionId)
  );

  return NextResponse.json({
    advanced: true,
    done: false,
    phase: result.phase ?? updatedState?.phase ?? currentPhase + 1,
    phaseEndsAt: updatedState?.phaseEndsAt ?? null,
  });
}
