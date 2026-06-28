import type { PhaseConfig, PhaseEntry, TargetEliminationConfig, PercentageEliminationConfig } from "@/types/gameplay";

/** Utility to find a phase entry by phase number in the config array */
export function getPhaseEntry(phaseConfig: PhaseConfig, phaseNumber: number): PhaseEntry | undefined {
  return phaseConfig.find((p) => p.phase === phaseNumber);
}

/** Compute phase duration in milliseconds from a phase entry or default 6 minutes */
export function getPhaseDurationMs(phaseEntry?: PhaseEntry): number {
  const durationMinutes = phaseEntry?.duration_minutes ?? 6;
  return durationMinutes * 60 * 1000;
}

/** Compute total session duration from phase config (sum of all phase durations) */
export function getTotalSessionDurationMs(phaseConfig: PhaseConfig): number {
  return phaseConfig.reduce((total, phase) => total + getPhaseDurationMs(phase), 0);
}

/** Legacy phase durations (for backward compatibility) */
export const LEGACY_PHASE_DURATIONS_MS = [6, 6, 5, 3].map((m) => m * 60 * 1000);

/** Compute Redis TTL from phase config (total session + 1 hour buffer) */
export function getPhaseStateTTLSeconds(phaseConfig?: PhaseConfig): number {
  if (!phaseConfig) {
    // Legacy default TTL for backward compatibility
    const legacyTotal = LEGACY_PHASE_DURATIONS_MS.reduce((a, b) => a + b, 0);
    return Math.ceil(legacyTotal / 1000) + 3600;
  }
  const totalMs = getTotalSessionDurationMs(phaseConfig);
  return Math.ceil(totalMs / 1000) + 3600;
}

/** Legacy TTL constant for backward compatibility (exported for old code) */
export const PHASE_STATE_TTL_SECONDS = getPhaseStateTTLSeconds();

/** Compute phase end time (supports both new phase config and legacy) */
export function computePhaseEndsAt(
  phase: number,
  phaseStartedAtMs: number,
  phaseConfig?: PhaseConfig
): number {
  if (phaseConfig) {
    const phaseEntry = getPhaseEntry(phaseConfig, phase);
    return phaseStartedAtMs + getPhaseDurationMs(phaseEntry);
  }
  const idx = Math.max(0, Math.min(phase - 1, LEGACY_PHASE_DURATIONS_MS.length - 1));
  return phaseStartedAtMs + LEGACY_PHASE_DURATIONS_MS[idx];
}

export function resolvePhaseTiming(input: {
  currentPhase?: number | null;
  phaseStartedAt?: string | null;
  phaseConfig?: PhaseConfig;
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
    phaseEndsAt = computePhaseEndsAt(phase, phaseStartedAtMs, input.phaseConfig);
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

/** Format phase elimination rule as a human-readable announcement */
export function formatPhaseAnnouncement(phaseEntry: PhaseEntry): string {
  if (phaseEntry.elimination_rule === "none") {
    return `Phase ${phaseEntry.phase} - Final Phase! No eliminations.`;
  }

  if (phaseEntry.elimination_rule === "target") {
    const config = phaseEntry.config as TargetEliminationConfig;
    return `Phase ${phaseEntry.phase} - Elimination rule: ${config.target}+ tokens advance, ${config.revivable_min}-${config.revivable_max} revivable, below ${config.eliminated_below} eliminated.`;
  }

  if (phaseEntry.elimination_rule === "percentage") {
    const config = phaseEntry.config as PercentageEliminationConfig;
    return `Phase ${phaseEntry.phase} - Elimination rule: Bottom ${config.eliminate_bottom_pct}% eliminated.`;
  }

  return `Phase ${phaseEntry.phase}`;
}
