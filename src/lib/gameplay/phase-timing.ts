/** Phase durations in ms: phases 1–4 (6 + 6 + 5 + 3 = 20 min total). */
export const PHASE_DURATIONS_MS = [6, 6, 5, 3].map((m) => m * 60 * 1000);

export const TOTAL_SESSION_DURATION_MS = PHASE_DURATIONS_MS.reduce((a, b) => a + b, 0);

/** Redis TTL: full session + 1 hour buffer. */
export const PHASE_STATE_TTL_SECONDS = Math.ceil(TOTAL_SESSION_DURATION_MS / 1000) + 3600;

export function computePhaseEndsAt(phase: number, phaseStartedAtMs: number): number {
  const idx = Math.max(0, Math.min(phase - 1, PHASE_DURATIONS_MS.length - 1));
  return phaseStartedAtMs + PHASE_DURATIONS_MS[idx];
}

export function resolvePhaseTiming(input: {
  currentPhase?: number | null;
  phaseStartedAt?: string | null;
  redisState?: {
    phase?: number;
    round?: number;
    phaseEndsAt?: number;
    phaseStartedAt?: number;
  } | null;
}) {
  const phase = input.redisState?.phase ?? input.currentPhase ?? 1;
  const round = input.redisState?.round ?? 1;

  let phaseStartedAtMs = input.redisState?.phaseStartedAt;
  if (!phaseStartedAtMs && input.phaseStartedAt) {
    phaseStartedAtMs = new Date(input.phaseStartedAt).getTime();
  }

  let phaseEndsAt = input.redisState?.phaseEndsAt;
  if (!phaseEndsAt && phaseStartedAtMs) {
    phaseEndsAt = computePhaseEndsAt(phase, phaseStartedAtMs);
  }

  return { phase, round, phaseStartedAtMs, phaseEndsAt };
}

export function formatCountdownHms(ms: number): string {
  if (ms <= 0) return "0h 0m 0s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}
