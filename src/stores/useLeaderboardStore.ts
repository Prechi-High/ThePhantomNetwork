/**
 * useLeaderboardStore — The Scoreboard
 *
 * Domain: Rankings and movement only.
 * Owns: global ranking, camp ranking, squad ranking, session ranking,
 *       personal rank, recent rank changes, movement trends, history.
 * Never owns: gameplay logic, effects, inventory.
 *
 * Independent failure — gameplay continues if leaderboard update is delayed.
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  session_tokens: number;
  squad_id: string;
  squad_name: string;
  alive: boolean;
  /** Normalised position 0–1 for spatial visualisations */
  position?: { x: number; y: number };
}

export interface SquadLeaderboardEntry {
  rank: number;
  squad_id: string;
  squad_name: string;
  squad_tokens: number;
  member_count: number;
  leader_name: string;
}

export interface RankMovement {
  userId: string;
  fromRank: number;
  toRank: number;
  delta: number;
  timestamp: number;
}

// ── State ──────────────────────────────────────────────────────────────────

interface LeaderboardStoreState {
  individual: LeaderboardEntry[];
  squad: SquadLeaderboardEntry[];
  playerRank: number;
  playerRankPercentile: number;
  /** Movement history — last 20 rank changes */
  rankMovements: RankMovement[];
  lastUpdatedAt: number | null;
  isStale: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface LeaderboardStoreActions {
  // Bulk updates (from server event)
  updateIndividual: (entries: LeaderboardEntry[]) => void;
  updateSquad:      (entries: SquadLeaderboardEntry[]) => void;
  setPlayerRank:    (rank: number, total: number) => void;

  // Incremental rank updates
  updateRank:      (userId: string, newRank: number) => void;
  updateTokens:    (userId: string, tokens: number) => void;
  updateSquadRank: (squadId: string, newRank: number) => void;
  updateSquadTokens: (squadId: string, tokens: number) => void;

  // Mark entry alive/eliminated
  markEliminated: (userId: string) => void;

  // Queries
  getTopN:          (n?: number) => LeaderboardEntry[];
  getTopSquads:     (n?: number) => SquadLeaderboardEntry[];
  getPlayerEntry:   (userId: string) => LeaderboardEntry | undefined;
  getRecentMovements: (limit?: number) => RankMovement[];

  // Staleness
  markStale: () => void;
  markFresh: () => void;

  // Recovery
  resetLeaderboard: () => void;
}

type LeaderboardStore = LeaderboardStoreState & LeaderboardStoreActions;

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL: LeaderboardStoreState = {
  individual:          [],
  squad:               [],
  playerRank:          0,
  playerRankPercentile: 0,
  rankMovements:       [],
  lastUpdatedAt:       null,
  isStale:             false,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  ...INITIAL,

  // ---- Bulk updates ----

  updateIndividual: (entries) =>
    set({ individual: entries, lastUpdatedAt: Date.now(), isStale: false }),

  updateSquad: (entries) =>
    set({ squad: entries }),

  setPlayerRank: (rank, total) =>
    set({
      playerRank: rank,
      playerRankPercentile: total > 0 ? Math.round(((total - rank) / total) * 100) : 0,
    }),

  // ---- Incremental updates ----

  updateRank: (userId, newRank) =>
    set((s) => {
      const prev = s.individual.find(e => e.user_id === userId);
      const movement: RankMovement | null = prev
        ? { userId, fromRank: prev.rank, toRank: newRank, delta: prev.rank - newRank, timestamp: Date.now() }
        : null;

      return {
        individual: s.individual.map(e =>
          e.user_id === userId ? { ...e, rank: newRank } : e
        ),
        rankMovements: movement
          ? [movement, ...s.rankMovements].slice(0, 20)
          : s.rankMovements,
      };
    }),

  updateTokens: (userId, tokens) =>
    set((s) => ({
      individual: s.individual
        .map(e => e.user_id === userId ? { ...e, session_tokens: tokens } : e)
        .sort((a, b) => b.session_tokens - a.session_tokens)
        .map((e, i) => ({ ...e, rank: i + 1 })),
    })),

  updateSquadRank: (squadId, newRank) =>
    set((s) => ({
      squad: s.squad.map(e =>
        e.squad_id === squadId ? { ...e, rank: newRank } : e
      ),
    })),

  updateSquadTokens: (squadId, tokens) =>
    set((s) => ({
      squad: s.squad
        .map(e => e.squad_id === squadId ? { ...e, squad_tokens: tokens } : e)
        .sort((a, b) => b.squad_tokens - a.squad_tokens)
        .map((e, i) => ({ ...e, rank: i + 1 })),
    })),

  markEliminated: (userId) =>
    set((s) => ({
      individual: s.individual.map(e =>
        e.user_id === userId ? { ...e, alive: false } : e
      ),
    })),

  // ---- Queries ----

  getTopN: (n = 10) => get().individual.slice(0, n),
  getTopSquads: (n = 5) => get().squad.slice(0, n),
  getPlayerEntry: (userId) => get().individual.find(e => e.user_id === userId),
  getRecentMovements: (limit = 5) => get().rankMovements.slice(0, limit),

  // ---- Staleness ----

  markStale: () => set({ isStale: true }),
  markFresh: () => set({ isStale: false, lastUpdatedAt: Date.now() }),

  // ---- Reset ----

  resetLeaderboard: () => set({ ...INITIAL }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectTopPlayers      = (n = 5) => (s: LeaderboardStore) => s.individual.slice(0, n);
export const selectTopSquads       = (n = 3) => (s: LeaderboardStore) => s.squad.slice(0, n);
export const selectPlayerRank      = (s: LeaderboardStore) => s.playerRank;
export const selectRankPercentile  = (s: LeaderboardStore) => s.playerRankPercentile;
export const selectRankMovements   = (s: LeaderboardStore) => s.rankMovements;
export const selectLeaderboardStale = (s: LeaderboardStore) => s.isStale;
