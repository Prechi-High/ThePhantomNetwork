import type { StealTarget } from "@/types/gameplay";
import { BASE_STEAL_AMOUNT, MAX_FIRE_BOOST_TAPS } from "@/types/gameplay";

export interface StealCandidate {
  userId: string;
  username: string;
  tokens: number;
  tokenScore: number;
  rivalryScore: number;
  recentStealScore: number;
}

export function computeTargetScore(candidate: StealCandidate): number {
  return (
    candidate.tokenScore * 0.5 +
    candidate.rivalryScore * 0.3 +
    candidate.recentStealScore * 0.2
  );
}

export function buildStealTargets(
  candidates: StealCandidate[],
  rivalIds: Set<string>
): StealTarget[] {
  const top3 = [...candidates]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 3);

  const rivals = candidates.filter((c) => rivalIds.has(c.userId));
  const seen = new Set<string>();
  const combined: StealTarget[] = [];

  for (const c of [...top3, ...rivals]) {
    if (seen.has(c.userId)) continue;
    seen.add(c.userId);
    const reason = rivalIds.has(c.userId)
      ? "Rival"
      : top3.some((t) => t.userId === c.userId)
        ? "Highest Tokens"
        : "High Tokens";
    combined.push({
      userId: c.userId,
      username: c.username,
      tokens: c.tokens,
      reason,
    });
  }

  return combined.slice(0, 8);
}

export function computeStealAmount(
  baseAmount: number,
  fireBoostTaps: number,
  stealBoostActive: boolean
): number {
  const boost = Math.min(fireBoostTaps, MAX_FIRE_BOOST_TAPS);
  let total = baseAmount + boost;
  if (stealBoostActive) total *= 1.5;
  return Math.round(total * 10) / 10;
}

export function isEligibleStealTarget(
  player: {
    userId: string;
    tokens: number;
    isEliminated: boolean;
    shieldCount: number;
    cloakActive: boolean;
  },
  attackerId: string
): boolean {
  if (player.userId === attackerId) return false;
  if (player.isEliminated) return false;
  if (player.tokens < 1) return false;
  if (player.cloakActive) return false;
  return true;
}
