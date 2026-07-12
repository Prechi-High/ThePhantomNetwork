/**
 * useStealStore — The Combat Officer
 *
 * Domain: Steal and combat only.
 * Owns: targets, selection, fire boost, steal history,
 *       cooldowns, risk analysis, rival tracking.
 * Never owns: tokens, inventory, session, effects outside combat context.
 *
 * Updated by the Gameplay Runtime after STEAL_ACTIVATED event.
 */

import { create } from "zustand";
import type { StealTarget } from "@/types/gameplay";

// ── Types ──────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface EnrichedTarget extends StealTarget {
  risk: RiskLevel;
  isRival: boolean;
  hasShield: boolean;
  hasCloak: boolean;
  streak: number;
  recentlyStoleFromMe: boolean;
  campId?: string;
  squadId?: string;
}

export interface StealRecord {
  id: string;
  victimId: string;
  victimUsername: string;
  amount: number;
  success: boolean;
  timestamp: number;
  boosted: boolean;
}

// ── State ──────────────────────────────────────────────────────────────────

interface StealStoreState {
  // Current steal session
  targets: StealTarget[];
  enrichedTargets: EnrichedTarget[];
  selectedTarget: StealTarget | null;
  isPickerOpen: boolean;
  stealInProgress: boolean;
  attackerId: string | null;

  // Fire boost
  fireBoostTaps: number;
  fireBoostMax: number;
  isFireBoostActive: boolean;

  // Cooldown
  cooldownEndsAt: number | null;

  // History (last 10 steal outcomes)
  stealHistory: StealRecord[];

  // Rivalry tracking
  recentRivals: Array<{ userId: string; username: string; stolenAt: number }>;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface StealStoreActions {
  // Target management
  setTargets: (targets: StealTarget[]) => void;
  setEnrichedTargets: (targets: EnrichedTarget[]) => void;
  setSelectedTarget: (target: StealTarget | null) => void;
  openPicker: () => void;
  closePicker: () => void;

  // Steal lifecycle
  beginSteal: (attackerId: string) => void;
  resolveSteal: (record: Omit<StealRecord, "id">) => void;
  cancelSteal: () => void;
  /** @deprecated Use beginSteal/cancelSteal. Kept for play page wiring. */
  setStealInProgress: (inProgress: boolean, attackerId?: string | null) => void;

  // Fire boost
  incrementFireBoost: () => void;
  activateFireBoost: () => void;
  resetFireBoost: () => void;

  // Cooldown
  setCooldown: (endsAt: number) => void;
  clearCooldown: () => void;
  getCooldownRemaining: () => number;

  // Rivalry
  addRival: (userId: string, username: string) => void;

  // Reset
  resetSteal: () => void;
}

type StealStore = StealStoreState & StealStoreActions;

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL: StealStoreState = {
  targets: [],
  enrichedTargets: [],
  selectedTarget: null,
  isPickerOpen: false,
  stealInProgress: false,
  attackerId: null,
  fireBoostTaps: 0,
  fireBoostMax: 5,
  isFireBoostActive: false,
  cooldownEndsAt: null,
  stealHistory: [],
  recentRivals: [],
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useStealStore = create<StealStore>((set, get) => ({
  ...INITIAL,

  // ---- Targets ----

  setTargets: (targets) => set({ targets }),
  setEnrichedTargets: (enrichedTargets) => set({ enrichedTargets }),
  setSelectedTarget: (selectedTarget) => set({ selectedTarget }),
  openPicker:  () => set({ isPickerOpen: true }),
  closePicker: () => set({ isPickerOpen: false, selectedTarget: null }),

  // ---- Steal lifecycle ----

  beginSteal: (attackerId) =>
    set({ stealInProgress: true, attackerId }),

  resolveSteal: (partial) => {
    const record: StealRecord = {
      id: `steal-${Date.now()}`,
      ...partial,
    };
    set((s) => ({
      stealInProgress: false,
      attackerId: null,
      selectedTarget: null,
      isPickerOpen: false,
      stealHistory: [record, ...s.stealHistory].slice(0, 10),
    }));
    get().resetFireBoost();
  },

  cancelSteal: () =>
    set({
      stealInProgress: false,
      attackerId: null,
      selectedTarget: null,
      isPickerOpen: false,
    }),

  setStealInProgress: (inProgress, attackerId = null) =>
    set({ stealInProgress: inProgress, attackerId: attackerId ?? null }),

  // ---- Fire boost ----

  incrementFireBoost: () =>
    set((s) => ({
      fireBoostTaps: Math.min(s.fireBoostTaps + 1, s.fireBoostMax),
    })),

  activateFireBoost: () =>
    set({ isFireBoostActive: true }),

  resetFireBoost: () =>
    set({ fireBoostTaps: 0, isFireBoostActive: false }),

  // ---- Cooldown ----

  setCooldown: (endsAt) => set({ cooldownEndsAt: endsAt }),
  clearCooldown: () => set({ cooldownEndsAt: null }),
  getCooldownRemaining: () => {
    const { cooldownEndsAt } = get();
    if (!cooldownEndsAt) return 0;
    return Math.max(0, cooldownEndsAt - Date.now());
  },

  // ---- Rivalry ----

  addRival: (userId, username) =>
    set((s) => ({
      recentRivals: [
        { userId, username, stolenAt: Date.now() },
        ...s.recentRivals.filter((r) => r.userId !== userId),
      ].slice(0, 5),
    })),

  // ---- Reset ----

  resetSteal: () => set({ ...INITIAL }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectStealTargets = (s: StealStore) => s.targets;
export const selectStealPicker = (s: StealStore) => ({
  isOpen:     s.isPickerOpen,
  targets:    s.targets,
  selected:   s.selectedTarget,
});
export const selectFireBoost = (s: StealStore) => ({
  taps:     s.fireBoostTaps,
  max:      s.fireBoostMax,
  isActive: s.isFireBoostActive,
});
export const selectCombatStatus = (s: StealStore) => ({
  stealInProgress: s.stealInProgress,
  attackerId:      s.attackerId,
});
