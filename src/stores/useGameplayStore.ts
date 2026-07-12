/**
 * useGameplayStore — The CPU
 *
 * Domain: Runtime gameplay state only.
 * Owns: current state, spin lifecycle, timeline, animation queue, history buffer.
 * Never owns: inventory, leaderboard, squad, session config, effects.
 */

import { create } from "zustand";
import type { SpinOutcome } from "@/types/gameplay";
import type { GameplayLifecycleState } from "@/lib/spin/stateMachine";

// ── Types ──────────────────────────────────────────────────────────────────

export type SpinRecord = {
  id: string;
  outcome: SpinOutcome;
  tokenDelta: number;
  timestamp: number;
};

export type AnimationTask = {
  id: string;
  type: "wheel" | "reveal" | "tokens" | "celebration" | "effect" | "ui";
  priority: number;
  durationMs: number;
  startedAt?: number;
};

export type AudioTask = {
  id: string;
  soundId: string;
  volume: number;
  loop: boolean;
  scheduledAt: number;
};

// ── Store interface ────────────────────────────────────────────────────────

interface GameplayStore {
  // ---- State fields ----
  lifecycleState: GameplayLifecycleState;

  // Player runtime
  tokens: number;
  isEliminated: boolean;
  isRevivable: boolean;

  // Spin (transient)
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  pendingTokenDelta: number;
  canSpin: boolean;

  // Phase/round (HUD reactivity)
  phase: number;
  round: number;
  phaseEndsAt: number | null;

  // Queues
  animationQueue: AnimationTask[];
  audioQueue: AudioTask[];

  // History buffer (last 5 spins)
  spinHistory: SpinRecord[];

  // Debug
  lastEventType: string | null;
  lastEventTimestamp: number | null;

  // ---- Actions ----
  enterState: (state: GameplayLifecycleState) => void;
  exitState: () => void;
  requestSpin: () => void;
  startReveal: (outcome: SpinOutcome, tokenDelta: number) => void;
  finishReveal: () => void;
  setTokens: (tokens: number) => void;
  addTokens: (delta: number) => void;
  setEliminated: (eliminated: boolean) => void;
  setRevivable: (revivable: boolean) => void;
  setSpinning: (spinning: boolean) => void;
  setSpinLocked: (locked: boolean) => void;
  setLastOutcome: (outcome: SpinOutcome | null) => void;
  setPhase: (phase: number) => void;
  setRound: (round: number) => void;
  setPhaseEndsAt: (ts: number | null) => void;
  queueAnimation: (task: AnimationTask) => void;
  dequeueAnimation: (id: string) => void;
  clearAnimationQueue: () => void;
  queueAudio: (task: AudioTask) => void;
  clearAudioQueue: () => void;
  recordSpin: (record: SpinRecord) => void;
  logEvent: (type: string) => void;
  resetGameplay: () => void;
}

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_STATE = {
  lifecycleState: "SESSION_LOADING" as GameplayLifecycleState,
  tokens: 0,
  isEliminated: false,
  isRevivable: false,
  isSpinning: false,
  spinLocked: false,
  lastOutcome: null as SpinOutcome | null,
  pendingTokenDelta: 0,
  canSpin: false,
  phase: 0,
  round: 0,
  phaseEndsAt: null as number | null,
  animationQueue: [] as AnimationTask[],
  audioQueue: [] as AudioTask[],
  spinHistory: [] as SpinRecord[],
  lastEventType: null as string | null,
  lastEventTimestamp: null as number | null,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useGameplayStore = create<GameplayStore>((set, get) => ({
  ...INITIAL_STATE,

  enterState: (lifecycleState) => {
    const canSpin = lifecycleState === "PLAYER_READY";
    const spinningStates: GameplayLifecycleState[] = [
      "SPIN_START", "SPIN_ACCELERATION", "SPIN_HIGH_SPEED",
      "SPIN_DECELERATION", "POINTER_ENGAGEMENT", "FINAL_LOCK",
    ];
    set({ lifecycleState, canSpin, isSpinning: spinningStates.includes(lifecycleState) });
  },

  exitState: () => {},

  requestSpin: () =>
    set({ isSpinning: true, spinLocked: true, canSpin: false }),

  startReveal: (outcome, tokenDelta) =>
    set({ lastOutcome: outcome, pendingTokenDelta: tokenDelta }),

  finishReveal: () => {
    const delta = get().pendingTokenDelta;
    set((s) => ({
      tokens: Math.round((s.tokens + delta) * 10) / 10,
      pendingTokenDelta: 0,
      isSpinning: false,
    }));
    setTimeout(() => set({ spinLocked: false, canSpin: true }), 500);
  },

  setTokens:      (tokens)      => set({ tokens }),
  addTokens:      (delta)       => set((s) => ({ tokens: Math.round((s.tokens + delta) * 10) / 10 })),
  setEliminated:  (isEliminated)=> set({ isEliminated }),
  setRevivable:   (isRevivable) => set({ isRevivable }),
  setSpinning:    (isSpinning)  => set({ isSpinning }),
  setSpinLocked:  (spinLocked)  => set({ spinLocked }),
  setLastOutcome: (lastOutcome) => set({ lastOutcome }),
  setPhase:       (phase)       => set({ phase }),
  setRound:       (round)       => set({ round }),
  setPhaseEndsAt: (phaseEndsAt) => set({ phaseEndsAt }),

  queueAnimation: (task) =>
    set((s) => ({
      animationQueue: [...s.animationQueue, task].sort((a, b) => b.priority - a.priority),
    })),
  dequeueAnimation: (id) =>
    set((s) => ({ animationQueue: s.animationQueue.filter((t) => t.id !== id) })),
  clearAnimationQueue: () => set({ animationQueue: [] }),

  queueAudio: (task) => set((s) => ({ audioQueue: [...s.audioQueue, task] })),
  clearAudioQueue: () => set({ audioQueue: [] }),

  recordSpin: (record) =>
    set((s) => ({ spinHistory: [record, ...s.spinHistory].slice(0, 5) })),

  logEvent: (type) =>
    set({ lastEventType: type, lastEventTimestamp: Date.now() }),

  resetGameplay: () => set({ ...INITIAL_STATE }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectSpinButtonState = (s: GameplayStore) => ({
  canSpin:     s.canSpin,
  isSpinning:  s.isSpinning,
  spinLocked:  s.spinLocked,
  isEliminated:s.isEliminated,
});
export const selectTokens      = (s: GameplayStore) => s.tokens;
export const selectPhaseState  = (s: GameplayStore) => ({ phase: s.phase, round: s.round, phaseEndsAt: s.phaseEndsAt });
export const selectRevealState = (s: GameplayStore) => ({ lastOutcome: s.lastOutcome, pendingTokenDelta: s.pendingTokenDelta });
export const selectDebugSnapshot = (s: GameplayStore) => ({
  lifecycleState:     s.lifecycleState,
  lastEventType:      s.lastEventType,
  lastEventTimestamp: s.lastEventTimestamp,
  spinHistory:        s.spinHistory,
  animationQueueLen:  s.animationQueue.length,
  audioQueueLen:      s.audioQueue.length,
});
