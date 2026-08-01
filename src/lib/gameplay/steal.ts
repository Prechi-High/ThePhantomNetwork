import type { StealTarget } from "@/types/gameplay";
import { BASE_STEAL_AMOUNT, MAX_FIRE_BOOST_TAPS } from "@/types/gameplay";

export interface StealCandidate {
  userId: string;
  username: string;
  tokens: number;
  rank?: number;
  tokenScore: number;
  rivalryScore: number;
  recentStealScore: number;
  recentActivityScore: number;
  attackedYouScore: number;
}

export function computeTargetScore(candidate: StealCandidate): number {
  return (
    candidate.tokenScore * 0.35 +
    candidate.rivalryScore * 0.25 +
    candidate.recentStealScore * 0.15 +
    candidate.recentActivityScore * 0.15 +
    candidate.attackedYouScore * 0.10
  );
}

function reasonForCandidate(
  c: StealCandidate,
  rivalIds: Set<string>,
  topTokenIds: Set<string>,
  recentActiveIds: Set<string>,
  attackedYouIds: Set<string>
): string {
  if (attackedYouIds.has(c.userId)) return "Recently Attacked You";
  if (rivalIds.has(c.userId)) return "Rival";
  if (recentActiveIds.has(c.userId)) return "Recently Active";
  if (topTokenIds.has(c.userId)) return "Highest Tokens";
  return "High Tokens";
}

export function buildStealTargets(
  candidates: StealCandidate[],
  rivalIds: Set<string>,
  recentActiveIds: Set<string> = new Set(),
  attackedYouIds: Set<string> = new Set()
): StealTarget[] {
  const top3 = [...candidates]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 3);
  const topTokenIds = new Set(top3.map((t) => t.userId));

  const scored = candidates.map((c) => ({
    candidate: c,
    score: computeTargetScore(c),
  }));

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const combined: StealTarget[] = [];

  for (const { candidate: c } of scored) {
    if (seen.has(c.userId)) continue;
    seen.add(c.userId);
    combined.push({
      userId: c.userId,
      username: c.username,
      tokens: c.tokens,
      rank: c.rank,
      reason: reasonForCandidate(c, rivalIds, topTokenIds, recentActiveIds, attackedYouIds),
      risk: c.tokens >= 10 ? "low" : c.tokens >= 5 ? "medium" : "high",
      isRival: rivalIds.has(c.userId),
      streak: attackedYouIds.has(c.userId) ? 2 : recentActiveIds.has(c.userId) ? 1 : 0,
      recentlyStole: attackedYouIds.has(c.userId),
    });
    if (combined.length >= 5) break;
  }

  return combined;
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
