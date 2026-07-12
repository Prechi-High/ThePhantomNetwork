/**
 * useWorldStore — The Living World Domain Store
 *
 * Domain: Everything about the persistent world state.
 * Owns: world timeline, camp momentum, world events,
 *       population signals, return summary, daily features.
 * Never owns: session gameplay, player inventory, HUD state.
 *
 * Independent failure — world features degrade gracefully
 * without affecting core gameplay.
 */

import { create } from "zustand";
import type { WorldHistoryEntry, WorldStats } from "@/lib/world/worldTimeline";
import type { CampMomentumEntry }              from "@/lib/world/campMomentum";
import type { WorldEvent }                     from "@/lib/world/worldEvents";
import type { PlayerReputation }               from "@/lib/world/reputationEngine";
import type { RivalryRecord }                  from "@/lib/world/rivalrySystem";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReturnSummary {
  lastSeenAt: number;
  sessionsCompleted: number;
  campRankChange: number;
  rivalWins: number;
  squadMembersRankedUp: string[];
  worldAnnouncements: WorldHistoryEntry[];
  worldRecords: WorldHistoryEntry[];
  isReady: boolean;
}

export interface DailyFeature {
  featuredCamp?:    { id: string; name: string; momentum: number };
  featuredSquad?:   { id: string; name: string; tokens: number };
  topRivalry?:      { playerA: string; playerB: string; score: string };
  playerSpotlight?: { userId: string; username: string; achievement: string };
  communityChallenge?: { title: string; description: string; progress: number };
}

// ── Store interface ────────────────────────────────────────────────────────

interface WorldStore {
  // ---- State ----
  worldHistory:      WorldHistoryEntry[];
  worldStats:        WorldStats | null;
  campMomentum:      CampMomentumEntry[];
  worldEvents:       WorldEvent[];
  activeWorldEvent:  WorldEvent | null;
  rivalries:         RivalryRecord[];
  myReputation:      PlayerReputation | null;
  returnSummary:     ReturnSummary | null;
  dailyFeature:      DailyFeature | null;
  isWorldLoaded:     boolean;
  lastWorldFetchAt:  number | null;

  // ---- Actions ----
  setWorldHistory:     (entries: WorldHistoryEntry[]) => void;
  addWorldEntry:       (entry: WorldHistoryEntry) => void;
  setWorldStats:       (stats: WorldStats) => void;
  setCampMomentum:     (camps: CampMomentumEntry[]) => void;
  setWorldEvents:      (events: WorldEvent[]) => void;
  setRivalries:        (rivalries: RivalryRecord[]) => void;
  setMyReputation:     (rep: PlayerReputation) => void;
  setReturnSummary:    (summary: ReturnSummary) => void;
  setDailyFeature:     (feature: DailyFeature) => void;
  markWorldLoaded:     () => void;

  // ---- Queries ----
  getTopCamps:         (n?: number) => CampMomentumEntry[];
  getRisingCamps:      () => CampMomentumEntry[];
  getCurrentEvent:     () => WorldEvent | undefined;
  getActiveRivalries:  () => RivalryRecord[];

  // ---- Reset ----
  resetWorld: () => void;
}

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_STATS: WorldStats = {
  totalSessions:       0,
  sessionsToday:       0,
  activeSessions:      0,
  playersOnline:       0,
  recentSteals:        0,
  revivesToday:        0,
  championshipPlayers: 0,
  squadRecruiting:     0,
  updatedAt:           0,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useWorldStore = create<WorldStore>((set, get) => ({
  worldHistory:     [],
  worldStats:       null,
  campMomentum:     [],
  worldEvents:      [],
  activeWorldEvent: null,
  rivalries:        [],
  myReputation:     null,
  returnSummary:    null,
  dailyFeature:     null,
  isWorldLoaded:    false,
  lastWorldFetchAt: null,

  setWorldHistory: (worldHistory) =>
    set({ worldHistory: worldHistory.slice(0, 100) }),

  addWorldEntry: (entry) =>
    set((s) => ({ worldHistory: [entry, ...s.worldHistory].slice(0, 100) })),

  setWorldStats: (worldStats) => set({ worldStats }),

  setCampMomentum: (campMomentum) => set({ campMomentum }),

  setWorldEvents: (worldEvents) => {
    const active = worldEvents.find((e) => e.status === "active" || e.status === "ending") ?? null;
    set({ worldEvents, activeWorldEvent: active });
  },

  setRivalries: (rivalries) => set({ rivalries }),

  setMyReputation: (myReputation) => set({ myReputation }),

  setReturnSummary: (returnSummary) => set({ returnSummary }),

  setDailyFeature: (dailyFeature) => set({ dailyFeature }),

  markWorldLoaded: () => set({ isWorldLoaded: true, lastWorldFetchAt: Date.now() }),

  // ---- Queries ----

  getTopCamps: (n = 5) =>
    [...get().campMomentum]
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, n),

  getRisingCamps: () =>
    get().campMomentum.filter((c) => c.trend === "rising" || c.trend === "surging"),

  getCurrentEvent: () =>
    get().worldEvents.find((e) => e.status === "active"),

  getActiveRivalries: () =>
    get().rivalries.filter((r) => r.status !== "dormant"),

  // ---- Reset ----

  resetWorld: () => set({
    worldHistory:     [],
    worldStats:       null,
    campMomentum:     [],
    worldEvents:      [],
    activeWorldEvent: null,
    rivalries:        [],
    myReputation:     null,
    returnSummary:    null,
    dailyFeature:     null,
    isWorldLoaded:    false,
    lastWorldFetchAt: null,
  }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectWorldStats          = (s: WorldStore) => s.worldStats ?? INITIAL_STATS;
export const selectWorldHistory        = (s: WorldStore) => s.worldHistory;
export const selectCampMomentum        = (s: WorldStore) => s.campMomentum;
export const selectActiveWorldEvent    = (s: WorldStore) => s.activeWorldEvent;
export const selectReturnSummary       = (s: WorldStore) => s.returnSummary;
export const selectMyReputation        = (s: WorldStore) => s.myReputation;
export const selectActiveRivalries     = (s: WorldStore) => s.rivalries.filter((r) => r.status !== "dormant");
export const selectIsWorldLoaded       = (s: WorldStore) => s.isWorldLoaded;
