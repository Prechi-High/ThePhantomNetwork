/**
 * useSessionStore — The Match Referee
 *
 * Domain: Session intelligence only.
 * Owns: session identity, phase config, countdown, prize pool,
 *       player counts, server time offset, session status.
 * Never owns: animations, HUD state, visual effects, gameplay logic.
 *
 * Updated by the Gameplay Runtime when the server provides session data.
 * Components subscribe to minimal slices.
 */

import { create } from "zustand";
import type { Database } from "@/types/database";
import type { SessionStatus } from "@/types/gameplay";

type Session = Database["public"]["Tables"]["sessions"]["Row"];

// ── Types ──────────────────────────────────────────────────────────────────

export interface PhaseRecord {
  phase: number;
  round: number;
  phaseEndsAt: number | null;
  phaseStartedAt: number | null;
  maxRoundsPerPhase: number;
}

export interface PlayerCounts {
  total: number;
  alive: number;
  eliminated: number;
}

// ── State ──────────────────────────────────────────────────────────────────

interface SessionStoreState {
  // Identity
  currentSession: Session | null;
  subSessionId: string | null;
  isRegistered: boolean;

  // Phase
  phase: PhaseRecord;

  // Prize
  poolCents: number;
  totalPoolCents: number;

  // Players
  players: PlayerCounts;

  // Server time
  serverTimeOffsetMs: number;
  lastSyncAt: number | null;
  isSynced: boolean;

  // Status
  sessionStatus: SessionStatus;
  isChampionship: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface SessionStoreActions {
  // Identity commands
  setCurrentSession: (session: Session | null) => void;
  setSubSessionId: (id: string | null) => void;
  setRegistered: (registered: boolean) => void;

  // Phase commands
  startRound: (phase: Partial<PhaseRecord>) => void;
  advancePhase: (nextPhase: number, phaseEndsAt: number | null) => void;
  endSession: () => void;

  // Server sync command
  syncServer: (serverTimeMs: number) => void;

  // Pool update
  setPoolCents: (cents: number) => void;
  setTotalPoolCents: (cents: number) => void;

  // Player counts
  setPlayerCounts: (counts: Partial<PlayerCounts>) => void;

  // Status
  setSessionStatus: (status: SessionStatus) => void;
  setChampionship: (isChampionship: boolean) => void;

  // Recovery reset
  resetSession: () => void;
}

type SessionStore = SessionStoreState & SessionStoreActions;

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_PHASE: PhaseRecord = {
  phase: 1,
  round: 1,
  phaseEndsAt: null,
  phaseStartedAt: null,
  maxRoundsPerPhase: 3,
};

const INITIAL_PLAYERS: PlayerCounts = {
  total: 0,
  alive: 0,
  eliminated: 0,
};

const INITIAL: SessionStoreState = {
  currentSession: null,
  subSessionId: null,
  isRegistered: false,
  phase: INITIAL_PHASE,
  poolCents: 0,
  totalPoolCents: 0,
  players: INITIAL_PLAYERS,
  serverTimeOffsetMs: 0,
  lastSyncAt: null,
  isSynced: false,
  sessionStatus: "active",
  isChampionship: false,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...INITIAL,

  // ---- Identity ----

  setCurrentSession: (currentSession) => set({ currentSession }),
  setSubSessionId:   (subSessionId)   => set({ subSessionId }),
  setRegistered:     (isRegistered)   => set({ isRegistered }),

  // ---- Phase commands ----

  startRound: (partial) =>
    set((s) => ({
      phase: {
        ...s.phase,
        ...partial,
        phaseStartedAt: Date.now(),
      },
    })),

  advancePhase: (nextPhase, phaseEndsAt) =>
    set((s) => ({
      phase: {
        ...s.phase,
        phase: nextPhase,
        round: 1,
        phaseEndsAt,
        phaseStartedAt: Date.now(),
      },
      isChampionship: nextPhase >= 5,
    })),

  endSession: () =>
    set({ sessionStatus: "completed" }),

  // ---- Server sync ----

  syncServer: (serverTimeMs) => {
    const offsetMs = serverTimeMs - Date.now();
    set({ serverTimeOffsetMs: offsetMs, lastSyncAt: Date.now(), isSynced: true });
  },

  // ---- Pool ----

  setPoolCents:      (poolCents)      => set({ poolCents }),
  setTotalPoolCents: (totalPoolCents) => set({ totalPoolCents }),

  // ---- Players ----

  setPlayerCounts: (counts) =>
    set((s) => ({ players: { ...s.players, ...counts } })),

  // ---- Status ----

  setSessionStatus:  (sessionStatus)   => set({ sessionStatus }),
  setChampionship:   (isChampionship)  => set({ isChampionship }),

  // ---- Recovery ----

  resetSession: () => set({ ...INITIAL }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectPhase = (s: SessionStore) => s.phase;
export const selectSubSessionId = (s: SessionStore) => s.subSessionId;
export const selectPlayerCounts = (s: SessionStore) => s.players;
export const selectPrizePool = (s: SessionStore) => ({
  poolCents:      s.poolCents,
  totalPoolCents: s.totalPoolCents,
});
export const selectSessionStatus = (s: SessionStore) => s.sessionStatus;
export const selectServerSync = (s: SessionStore) => ({
  serverTimeOffsetMs: s.serverTimeOffsetMs,
  isSynced:           s.isSynced,
  lastSyncAt:         s.lastSyncAt,
});
