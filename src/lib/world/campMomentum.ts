/**
 * Camp Momentum — Persistent Camp Influence Tracking
 *
 * Every camp has momentum. It rises and falls based on:
 *   - Session wins
 *   - Token accumulation
 *   - Player activity
 *   - Championship results
 *   - Time decay (inactive camps lose momentum)
 *
 * Players feel: "My camp needs me."
 */

export type MomentumTrend = "rising" | "holding" | "falling" | "surging" | "collapsing";

export interface CampMomentumEntry {
  campId: string;
  campName: string;
  campAvatar?: string;
  /** 0–100 momentum score */
  momentum: number;
  trend: MomentumTrend;
  /** Rank in current region */
  regionRank: number;
  /** Change in rank since yesterday */
  rankDelta: number;
  /** Win streak */
  winStreak: number;
  /** Active members right now */
  activeMembers: number;
  /** Token total this week */
  weeklyTokens: number;
  /** Last time momentum changed */
  lastActivityAt: number;
  /** Notable recent achievement */
  recentAchievement?: string;
}

const TREND_THRESHOLDS = {
  surging:    10,
  rising:     2,
  holding:    -2,
  falling:    -10,
  collapsing: -Infinity,
} as const;

function computeTrend(delta: number): MomentumTrend {
  if (delta >= TREND_THRESHOLDS.surging)  return "surging";
  if (delta >= TREND_THRESHOLDS.rising)   return "rising";
  if (delta >= TREND_THRESHOLDS.holding)  return "holding";
  if (delta >= TREND_THRESHOLDS.falling)  return "falling";
  return "collapsing";
}

// ── Camp Momentum Engine ──────────────────────────────────────────────────

export class CampMomentumEngine {
  private camps: Map<string, CampMomentumEntry> = new Map();
  private listeners: Set<(camps: CampMomentumEntry[]) => void> = new Set();

  update(entry: CampMomentumEntry): void {
    this.camps.set(entry.campId, entry);
    this.notifyListeners();
  }

  bulkUpdate(entries: CampMomentumEntry[]): void {
    entries.forEach((e) => this.camps.set(e.campId, e));
    this.notifyListeners();
  }

  applyWin(campId: string, tokensEarned: number): void {
    const camp = this.camps.get(campId);
    if (!camp) return;
    const newMomentum = Math.min(100, camp.momentum + 5 + Math.min(tokensEarned / 100, 3));
    const delta = newMomentum - camp.momentum;
    this.camps.set(campId, {
      ...camp,
      momentum:        newMomentum,
      trend:           computeTrend(delta),
      winStreak:       camp.winStreak + 1,
      weeklyTokens:    camp.weeklyTokens + tokensEarned,
      lastActivityAt:  Date.now(),
    });
    this.notifyListeners();
  }

  applyDecay(): void {
    const now = Date.now();
    this.camps.forEach((camp, id) => {
      const hoursSinceActivity = (now - camp.lastActivityAt) / 3_600_000;
      if (hoursSinceActivity > 2) {
        const decay = Math.min(hoursSinceActivity * 0.5, 10);
        const newMomentum = Math.max(0, camp.momentum - decay);
        this.camps.set(id, {
          ...camp,
          momentum: newMomentum,
          trend:    computeTrend(-decay),
        });
      }
    });
    this.notifyListeners();
  }

  getAll(): CampMomentumEntry[] {
    return Array.from(this.camps.values()).sort((a, b) => b.momentum - a.momentum);
  }

  getTop(n = 5): CampMomentumEntry[] {
    return this.getAll().slice(0, n);
  }

  get(campId: string): CampMomentumEntry | undefined {
    return this.camps.get(campId);
  }

  getRising(): CampMomentumEntry[] {
    return this.getAll().filter((c) => c.trend === "rising" || c.trend === "surging");
  }

  onChange(fn: (camps: CampMomentumEntry[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notifyListeners(): void {
    const all = this.getAll();
    this.listeners.forEach((fn) => fn(all));
  }
}

export const campMomentumEngine = new CampMomentumEngine();
