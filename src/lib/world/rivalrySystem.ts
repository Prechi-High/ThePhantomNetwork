/**
 * Rivalry System — Persistent Player Rivalries
 *
 * Rivalries are not temporary. The system remembers.
 * Natural narratives emerge from repeated interactions.
 *
 * Example:
 *   You stole from NightWolf 12 times.
 *   NightWolf defeated you twice.
 *   Your rivalry has lasted 18 days.
 *   Current Score: 12–2
 */

export type RivalryStatus =
  | "emerging"    // < 3 interactions
  | "active"      // regular interactions
  | "intense"     // frequent, close score
  | "dominant"    // one side winning heavily
  | "historic"    // long-running, many interactions
  | "dormant";    // no interaction in > 7 days

export interface RivalryRecord {
  rivalId: string;
  rivalUsername: string;
  rivalAvatar?: string;
  /** Times you stole from them */
  stolenFrom: number;
  /** Times they stole from you */
  stolenBy: number;
  /** Times you revived them */
  revivedThem: number;
  /** Times they revived you */
  revivedByThem: number;
  /** Your score (net advantage) */
  yourScore: number;
  /** Their score */
  theirScore: number;
  /** Total sessions where you both participated */
  sharedSessions: number;
  /** Days since first interaction */
  daysActive: number;
  firstInteractionAt: number;
  lastInteractionAt: number;
  status: RivalryStatus;
  /** Notable moment description */
  legendaryMoment?: string;
}

function computeRivalryStatus(r: RivalryRecord): RivalryStatus {
  const totalInteractions = r.stolenFrom + r.stolenBy;
  const daysSinceLast     = (Date.now() - r.lastInteractionAt) / 86_400_000;

  if (daysSinceLast > 7)               return "dormant";
  if (r.daysActive > 14 && totalInteractions > 20) return "historic";
  if (totalInteractions < 3)           return "emerging";
  const scoreDiff = Math.abs(r.yourScore - r.theirScore);
  if (scoreDiff > 8)                   return "dominant";
  if (totalInteractions > 8)           return "intense";
  return "active";
}

// ── Rivalry System ────────────────────────────────────────────────────────

export class RivalrySystem {
  private rivalries: Map<string, RivalryRecord> = new Map();

  recordSteal(rivalId: string, rivalUsername: string, amount: number): RivalryRecord {
    const record = this.getOrCreate(rivalId, rivalUsername);
    const updated: RivalryRecord = {
      ...record,
      stolenFrom:        record.stolenFrom + 1,
      yourScore:         record.yourScore + 1,
      lastInteractionAt: Date.now(),
      daysActive:        Math.floor((Date.now() - record.firstInteractionAt) / 86_400_000),
    };
    if (amount > 5 && !updated.legendaryMoment) {
      updated.legendaryMoment = `You stole ${amount} tokens in one hit`;
    }
    updated.status = computeRivalryStatus(updated);
    this.rivalries.set(rivalId, updated);
    return updated;
  }

  recordStolenFrom(rivalId: string, rivalUsername: string): RivalryRecord {
    const record = this.getOrCreate(rivalId, rivalUsername);
    const updated: RivalryRecord = {
      ...record,
      stolenBy:          record.stolenBy + 1,
      theirScore:        record.theirScore + 1,
      lastInteractionAt: Date.now(),
      daysActive:        Math.floor((Date.now() - record.firstInteractionAt) / 86_400_000),
    };
    updated.status = computeRivalryStatus(updated);
    this.rivalries.set(rivalId, updated);
    return updated;
  }

  recordRevive(rivalId: string, rivalUsername: string, byThem = false): void {
    const record = this.getOrCreate(rivalId, rivalUsername);
    const updated: RivalryRecord = {
      ...record,
      revivedThem:       byThem ? record.revivedThem     : record.revivedThem + 1,
      revivedByThem:     byThem ? record.revivedByThem + 1 : record.revivedByThem,
      lastInteractionAt: Date.now(),
    };
    updated.status = computeRivalryStatus(updated);
    this.rivalries.set(rivalId, updated);
  }

  recordSharedSession(rivalId: string, rivalUsername: string): void {
    const record = this.getOrCreate(rivalId, rivalUsername);
    const updated: RivalryRecord = {
      ...record,
      sharedSessions: record.sharedSessions + 1,
      lastInteractionAt: Date.now(),
    };
    updated.status = computeRivalryStatus(updated);
    this.rivalries.set(rivalId, updated);
  }

  getAllRivalries(): RivalryRecord[] {
    return Array.from(this.rivalries.values())
      .sort((a, b) => b.lastInteractionAt - a.lastInteractionAt);
  }

  getActiveRivalries(): RivalryRecord[] {
    return this.getAllRivalries().filter((r) => r.status !== "dormant");
  }

  getTopRival(): RivalryRecord | undefined {
    return this.getAllRivalries().find((r) => r.status === "intense" || r.status === "historic");
  }

  getRivalry(rivalId: string): RivalryRecord | undefined {
    return this.rivalries.get(rivalId);
  }

  getSummaryText(rivalId: string): string {
    const r = this.rivalries.get(rivalId);
    if (!r) return "";
    const lines: string[] = [];
    if (r.stolenFrom > 0) lines.push(`You stole from ${r.rivalUsername} ${r.stolenFrom} time${r.stolenFrom > 1 ? "s" : ""}`);
    if (r.stolenBy > 0)   lines.push(`${r.rivalUsername} stole from you ${r.stolenBy} time${r.stolenBy > 1 ? "s" : ""}`);
    if (r.daysActive > 0) lines.push(`Your rivalry has lasted ${r.daysActive} day${r.daysActive > 1 ? "s" : ""}`);
    lines.push(`Score: ${r.yourScore}–${r.theirScore}`);
    return lines.join(" · ");
  }

  hydrate(records: RivalryRecord[]): void {
    records.forEach((r) => this.rivalries.set(r.rivalId, r));
  }

  private getOrCreate(rivalId: string, rivalUsername: string): RivalryRecord {
    return this.rivalries.get(rivalId) ?? {
      rivalId,
      rivalUsername,
      stolenFrom: 0, stolenBy: 0,
      revivedThem: 0, revivedByThem: 0,
      yourScore: 0, theirScore: 0,
      sharedSessions: 0,
      daysActive: 0,
      firstInteractionAt: Date.now(),
      lastInteractionAt:  Date.now(),
      status: "emerging",
    };
  }
}

export const rivalrySystem = new RivalrySystem();
