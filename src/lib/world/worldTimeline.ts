/**
 * World Timeline — Persistent World History Engine
 *
 * The world continues whether the player is online or not.
 * Every session, steal, revive, and championship leaves a permanent footprint.
 *
 * Answers: "What have I missed?"
 */

export type WorldEventType =
  | "session_completed"
  | "championship_won"
  | "camp_overtaken"
  | "player_ranked_up"
  | "squad_milestone"
  | "legendary_steal"
  | "legendary_revive"
  | "world_record"
  | "global_announcement"
  | "world_event_started"
  | "world_event_ended"
  | "daily_featured";

export interface WorldHistoryEntry {
  id: string;
  type: WorldEventType;
  timestamp: number;
  headline: string;
  detail?: string;
  /** Player, squad, or camp involved */
  actor?: { id: string; name: string; type: "player" | "squad" | "camp" };
  /** Numeric value (tokens, sessions, etc.) */
  value?: number;
  /** Whether this entry is a world record */
  isRecord?: boolean;
  /** Session ID if related to a session */
  sessionId?: string;
}

export interface WorldStats {
  /** Total sessions completed all-time */
  totalSessions: number;
  /** Sessions completed today */
  sessionsToday: number;
  /** Active sessions right now */
  activeSessions: number;
  /** Players online right now */
  playersOnline: number;
  /** Steals in last 60 minutes */
  recentSteals: number;
  /** Revives today */
  revivesToday: number;
  /** Championship players (top tier) */
  championshipPlayers: number;
  /** Squads currently recruiting */
  squadRecruiting: number;
  /** Last updated */
  updatedAt: number;
}

export interface WorldRecord {
  category: string;
  holder: string;
  holderId: string;
  value: number;
  achievedAt: number;
  sessionId?: string;
}

// ── Timeline Manager ──────────────────────────────────────────────────────

export class WorldTimeline {
  private history: WorldHistoryEntry[] = [];
  private stats: WorldStats = this.emptyStats();
  private records: WorldRecord[] = [];
  private maxHistorySize = 200;
  private listeners: Set<(entry: WorldHistoryEntry) => void> = new Set();

  // ---- History ----

  addEntry(entry: WorldHistoryEntry): void {
    this.history.unshift(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    this.listeners.forEach((fn) => fn(entry));
  }

  getHistory(limit = 50): WorldHistoryEntry[] {
    return this.history.slice(0, limit);
  }

  getByType(type: WorldEventType, limit = 20): WorldHistoryEntry[] {
    return this.history.filter((e) => e.type === type).slice(0, limit);
  }

  getRecords(): WorldHistoryEntry[] {
    return this.history.filter((e) => e.isRecord).slice(0, 10);
  }

  onEntry(fn: (entry: WorldHistoryEntry) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // ---- World stats ----

  updateStats(partial: Partial<WorldStats>): void {
    this.stats = { ...this.stats, ...partial, updatedAt: Date.now() };
  }

  getStats(): WorldStats { return { ...this.stats }; }

  // ---- World records ----

  checkRecord(category: string, value: number, holder: string, holderId: string, sessionId?: string): boolean {
    const existing = this.records.find((r) => r.category === category);
    if (!existing || value > existing.value) {
      const record: WorldRecord = { category, holder, holderId, value, achievedAt: Date.now(), sessionId };
      this.records = this.records.filter((r) => r.category !== category);
      this.records.push(record);

      this.addEntry({
        id: `record-${category}-${Date.now()}`,
        type: "world_record",
        timestamp: Date.now(),
        headline: `${holder} set a new world record`,
        detail: `${category}: ${value}`,
        actor: { id: holderId, name: holder, type: "player" },
        value,
        isRecord: true,
        sessionId,
      });
      return true;
    }
    return false;
  }

  getRecord(category: string): WorldRecord | undefined {
    return this.records.find((r) => r.category === category);
  }

  getAllRecords(): WorldRecord[] { return [...this.records]; }

  // ---- Return experience: "What did you miss?" ----

  getMissedSummary(sinceTimestamp: number): {
    sessionsCompleted: number;
    steals: number;
    revives: number;
    campChanges: WorldHistoryEntry[];
    rankUps: WorldHistoryEntry[];
    announcements: WorldHistoryEntry[];
    records: WorldHistoryEntry[];
  } {
    const since = this.history.filter((e) => e.timestamp > sinceTimestamp);
    return {
      sessionsCompleted: since.filter((e) => e.type === "session_completed").length,
      steals:            since.filter((e) => e.type === "legendary_steal").length,
      revives:           since.filter((e) => e.type === "legendary_revive").length,
      campChanges:       since.filter((e) => e.type === "camp_overtaken"),
      rankUps:           since.filter((e) => e.type === "player_ranked_up"),
      announcements:     since.filter((e) => e.type === "global_announcement"),
      records:           since.filter((e) => e.isRecord),
    };
  }

  private emptyStats(): WorldStats {
    return {
      totalSessions:      0,
      sessionsToday:      0,
      activeSessions:     0,
      playersOnline:      0,
      recentSteals:       0,
      revivesToday:       0,
      championshipPlayers:0,
      squadRecruiting:    0,
      updatedAt:          Date.now(),
    };
  }
}

export const worldTimeline = new WorldTimeline();
