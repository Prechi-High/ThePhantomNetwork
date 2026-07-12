/**
 * useEffectsStore — The Status Manager
 *
 * Domain: Active temporary effects only.
 * Owns: shields, insurance, cloak, boosts, revive buffs,
 *       stack counts, durations, expiration timestamps, visual flags.
 * Never owns: gameplay decisions, spin logic, inventory permanence.
 *
 * Responds to EFFECT_APPLIED / EFFECT_EXPIRED events from Runtime.
 * Independent failure — gameplay continues if effects fail to load.
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export type EffectType = "shield" | "cloak" | "multiplier" | "insurance" | "boost" | "revive_buff";

export interface ActiveEffect {
  id: string;
  type: EffectType;
  name: string;
  duration_ms: number;
  started_at: string;   // ISO
  expires_at: string;   // ISO
  icon: string;
  stackCount?: number;
  /** Multiplier value for boost effects (e.g. 1.5 = 50% boost) */
  multiplier?: number;
  /** Whether this effect has been visually announced to the player */
  announced?: boolean;
}

// ── State ──────────────────────────────────────────────────────────────────

interface EffectsStoreState {
  effects: ActiveEffect[];
  /** Flag: at least one shield is active */
  hasShield: boolean;
  /** Flag: cloak is active */
  hasCloak: boolean;
  /** Flag: insurance is active */
  hasInsurance: boolean;
  /** Current boost multiplier (1.0 if none) */
  boostMultiplier: number;
  /** Last expired effect (for visual feedback) */
  lastExpired: ActiveEffect | null;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface EffectsStoreActions {
  // Mutations — called by Runtime / realtime hooks
  addEffect: (effect: ActiveEffect) => void;
  removeEffect: (effectId: string) => void;
  setEffects: (effects: ActiveEffect[]) => void;
  markAnnounced: (effectId: string) => void;

  // Queries
  getTimeRemaining: (effectId: string) => number;
  isExpired: (effectId: string) => boolean;
  getEffect: (effectId: string) => ActiveEffect | undefined;
  getEffectsByType: (type: EffectType) => ActiveEffect[];

  // Commands
  activateShield: (effect: Omit<ActiveEffect, "type">) => void;
  expireShield: (effectId: string) => void;
  activateBoost: (effect: Omit<ActiveEffect, "type">) => void;
  removeEffect_byType: (type: EffectType) => void;

  // Recovery
  clearExpired: () => void;
  resetEffects: () => void;
}

type EffectsStore = EffectsStoreState & EffectsStoreActions;

// ── Derived flags helper ───────────────────────────────────────────────────

function deriveFlags(effects: ActiveEffect[]) {
  const now = Date.now();
  const active = effects.filter(e => new Date(e.expires_at).getTime() > now);
  const hasShield    = active.some(e => e.type === "shield");
  const hasCloak     = active.some(e => e.type === "cloak");
  const hasInsurance = active.some(e => e.type === "insurance");
  const boost        = active.find(e => e.type === "boost");
  const boostMultiplier = boost?.multiplier ?? 1.0;
  return { hasShield, hasCloak, hasInsurance, boostMultiplier };
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useEffectsStore = create<EffectsStore>((set, get) => ({
  effects: [],
  hasShield: false,
  hasCloak: false,
  hasInsurance: false,
  boostMultiplier: 1.0,
  lastExpired: null,

  // ---- Add / remove ----

  addEffect: (effect) =>
    set((s) => {
      const updated = [...s.effects, effect];
      return { effects: updated, ...deriveFlags(updated) };
    }),

  removeEffect: (effectId) =>
    set((s) => {
      const expired = s.effects.find(e => e.id === effectId) ?? null;
      const updated = s.effects.filter(e => e.id !== effectId);
      return { effects: updated, lastExpired: expired, ...deriveFlags(updated) };
    }),

  setEffects: (effects) =>
    set({ effects: effects.slice(0, 20), ...deriveFlags(effects) }),

  markAnnounced: (effectId) =>
    set((s) => ({
      effects: s.effects.map(e => e.id === effectId ? { ...e, announced: true } : e),
    })),

  // ---- Queries ----

  getTimeRemaining: (effectId) => {
    const e = get().effects.find(x => x.id === effectId);
    if (!e) return 0;
    return Math.max(0, new Date(e.expires_at).getTime() - Date.now());
  },

  isExpired: (effectId) => {
    const e = get().effects.find(x => x.id === effectId);
    if (!e) return true;
    return new Date(e.expires_at).getTime() <= Date.now();
  },

  getEffect: (effectId) => get().effects.find(e => e.id === effectId),

  getEffectsByType: (type) => get().effects.filter(e => e.type === type),

  // ---- Typed commands ----

  activateShield: (partial) => {
    const effect: ActiveEffect = { ...partial, type: "shield" };
    get().addEffect(effect);
  },

  expireShield: (effectId) => {
    get().removeEffect(effectId);
  },

  activateBoost: (partial) => {
    const effect: ActiveEffect = { ...partial, type: "boost" };
    get().addEffect(effect);
  },

  removeEffect_byType: (type) =>
    set((s) => {
      const updated = s.effects.filter(e => e.type !== type);
      return { effects: updated, ...deriveFlags(updated) };
    }),

  // ---- Cleanup ----

  clearExpired: () =>
    set((s) => {
      const now = Date.now();
      const updated = s.effects.filter(e => new Date(e.expires_at).getTime() > now);
      return { effects: updated, ...deriveFlags(updated) };
    }),

  resetEffects: () =>
    set({
      effects: [],
      hasShield: false,
      hasCloak: false,
      hasInsurance: false,
      boostMultiplier: 1.0,
      lastExpired: null,
    }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectActiveEffects = (s: EffectsStore) => s.effects;
export const selectEffectFlags = (s: EffectsStore) => ({
  hasShield:       s.hasShield,
  hasCloak:        s.hasCloak,
  hasInsurance:    s.hasInsurance,
  boostMultiplier: s.boostMultiplier,
});
export const selectLastExpiredEffect = (s: EffectsStore) => s.lastExpired;
