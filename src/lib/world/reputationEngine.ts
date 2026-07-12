/**
 * Reputation Engine — Player Identity From Behavior
 *
 * Players don't choose their identity. It emerges from actions.
 * Reputation is computed from cumulative behavior across sessions.
 *
 * Archetypes:
 *   aggressive    — high steal count, low revive count
 *   strategist    — high survival rate, selective steals
 *   medic         — high revive count, squad-focused
 *   collector     — high token total, low steal ratio
 *   champion      — multiple championship finishes
 *   clutch        — wins from elimination zone
 *   risk_taker    — high fire boost usage, bold steal targets
 *   survivor      — longest average session duration
 */

export type PlayerArchetype =
  | "aggressive"
  | "strategist"
  | "medic"
  | "collector"
  | "champion"
  | "clutch_survivor"
  | "risk_taker"
  | "survivor"
  | "phantom";  // rare — top 1%

export interface PlayerBehaviorStats {
  totalSessions:       number;
  totalSteals:         number;
  totalRevives:        number;
  totalTokens:         number;
  championshipWins:    number;
  eliminationsAvoided: number;
  fireBoostUses:       number;
  avgSurvivalRank:     number;   // 0–100 percentile
  winRate:             number;   // 0–1
  squadContributions:  number;
}

export interface PlayerReputation {
  userId: string;
  username: string;
  primaryArchetype:   PlayerArchetype;
  secondaryArchetype?: PlayerArchetype;
  /** 0–100 reputation score */
  reputationScore: number;
  /** Badge label for display */
  badgeLabel: string;
  /** Badge color */
  badgeColor: string;
  /** One-line description */
  description: string;
  stats: PlayerBehaviorStats;
  lastComputedAt: number;
}

// ── Archetype computation ─────────────────────────────────────────────────

function computeArchetype(stats: PlayerBehaviorStats): {
  primary: PlayerArchetype;
  secondary?: PlayerArchetype;
} {
  if (stats.totalSessions === 0) return { primary: "survivor" };

  const stealRate     = stats.totalSteals    / Math.max(1, stats.totalSessions);
  const reviveRate    = stats.totalRevives   / Math.max(1, stats.totalSessions);
  const avgTokens     = stats.totalTokens    / Math.max(1, stats.totalSessions);
  const championRate  = stats.championshipWins / Math.max(1, stats.totalSessions);

  // Phantom — top tier composite
  if (championRate > 0.1 && stealRate > 2 && reviveRate > 0.5 && stats.avgSurvivalRank > 80) {
    return { primary: "phantom", secondary: "champion" };
  }
  if (stats.championshipWins >= 5 && stats.winRate > 0.15) {
    return { primary: "champion", secondary: stealRate > 2 ? "aggressive" : "collector" };
  }
  if (reviveRate > 1.5 && stats.squadContributions > 20) {
    return { primary: "medic", secondary: "survivor" };
  }
  if (stealRate > 3 && reviveRate < 0.3) {
    return { primary: "aggressive", secondary: "risk_taker" };
  }
  if (stats.fireBoostUses > stats.totalSessions * 0.8) {
    return { primary: "risk_taker", secondary: "aggressive" };
  }
  if (avgTokens > 50 && stealRate < 0.5) {
    return { primary: "collector", secondary: "strategist" };
  }
  if (stats.eliminationsAvoided > stats.totalSessions * 0.7 && stealRate > 0.5) {
    return { primary: "clutch_survivor", secondary: "strategist" };
  }
  if (stats.avgSurvivalRank > 60 && stealRate < 1.5) {
    return { primary: "strategist" };
  }
  return { primary: "survivor" };
}

const ARCHETYPE_DISPLAY: Record<PlayerArchetype, { label: string; color: string; description: string }> = {
  aggressive:      { label: "Aggressor",     color: "#EF4444", description: "Strikes fast and often" },
  strategist:      { label: "Strategist",    color: "#3B82F6", description: "Calculates every move" },
  medic:           { label: "Medic",         color: "#22C55E", description: "Keeps the squad alive" },
  collector:       { label: "Collector",     color: "#F59E0B", description: "Accumulates quietly" },
  champion:        { label: "Champion",      color: "#FFD700", description: "Wins when it matters" },
  clutch_survivor: { label: "Clutch",        color: "#A855F7", description: "Survives the impossible" },
  risk_taker:      { label: "Risk Taker",    color: "#F97316", description: "Never plays it safe" },
  survivor:        { label: "Survivor",      color: "#6B7280", description: "Built to endure" },
  phantom:         { label: "Phantom",       color: "#C084FC", description: "Transcends the game" },
};

// ── Reputation Engine ─────────────────────────────────────────────────────

export class ReputationEngine {
  private cache: Map<string, PlayerReputation> = new Map();

  compute(userId: string, username: string, stats: PlayerBehaviorStats): PlayerReputation {
    const { primary, secondary } = computeArchetype(stats);
    const display = ARCHETYPE_DISPLAY[primary];

    // Score: weighted composite
    const score = Math.min(100, Math.round(
      (stats.winRate * 30)             +
      (Math.min(stats.championshipWins, 10) * 3) +
      (Math.min(stats.avgSurvivalRank, 100) * 0.3) +
      (Math.min(stats.squadContributions, 50) * 0.2)
    ));

    const reputation: PlayerReputation = {
      userId,
      username,
      primaryArchetype:   primary,
      secondaryArchetype: secondary,
      reputationScore:    score,
      badgeLabel:         display.label,
      badgeColor:         display.color,
      description:        display.description,
      stats,
      lastComputedAt:     Date.now(),
    };

    this.cache.set(userId, reputation);
    return reputation;
  }

  get(userId: string): PlayerReputation | undefined {
    return this.cache.get(userId);
  }

  hydrate(reputations: PlayerReputation[]): void {
    reputations.forEach((r) => this.cache.set(r.userId, r));
  }
}

export const reputationEngine = new ReputationEngine();
