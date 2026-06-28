import type { PhaseConfig, PhaseEntry, PlayerState, TargetEliminationConfig } from "@/types/gameplay";
import { REVIVE_COST } from "@/types/gameplay";
import { getPhaseEntry } from "@/lib/gameplay/phase-timing";

export type Phase1Category = "passed" | "revivable" | "eliminated";

export function classifyTargetElimination(
  tokens: number,
  config: TargetEliminationConfig
): Phase1Category {
  if (tokens >= config.target) return "passed";
  if (tokens >= config.revivable_min && tokens <= config.revivable_max) return "revivable";
  return "eliminated";
}

export function classifyPercentileElimination(
  players: { userId: string; tokens: number }[],
  eliminateBottomPct: number
): { survivors: string[]; eliminated: string[] } {
  const sorted = [...players].sort((a, b) => b.tokens - a.tokens);
  const survivorCount = Math.ceil(sorted.length * (1 - eliminateBottomPct / 100));
  const survivors = sorted.slice(0, survivorCount).map((p) => p.userId);
  const eliminated = sorted.slice(survivorCount).map((p) => p.userId);
  return { survivors, eliminated };
}

export function canContributeToRevive(
  contributor: PlayerState,
  targetTokens: number,
  phase1Target: number,
  amount: number
): boolean {
  if (contributor.isEliminated) return false;
  if (contributor.tokens < amount) return false;
  if (contributor.tokens - amount < phase1Target) return false;
  return amount >= 1 && amount <= REVIVE_COST;
}

export function applyReviveContribution(
  remaining: number,
  contribution: number
): { remaining: number; revived: boolean } {
  const newRemaining = remaining - contribution;
  return { remaining: newRemaining, revived: newRemaining <= 0 };
}
