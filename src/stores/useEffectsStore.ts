import { create } from 'zustand';

export interface ActiveEffect {
  id: string;
  type: 'shield' | 'cloak' | 'multiplier' | 'insurance';
  name: string;
  duration_ms: number;
  started_at: string;
  expires_at: string;
  icon: string;
}

interface EffectsStore {
  effects: ActiveEffect[];
  addEffect: (effect: ActiveEffect) => void;
  removeEffect: (effectId: string) => void;
  setEffects: (effects: ActiveEffect[]) => void;
  getTimeRemaining: (effectId: string) => number;
  isExpired: (effectId: string) => boolean;
}

export const useEffectsStore = create<EffectsStore>((set, get) => ({
  effects: [],

  addEffect: (effect: ActiveEffect) =>
    set((state) => ({
      effects: [...state.effects, effect],
    })),

  removeEffect: (effectId: string) =>
    set((state) => ({
      effects: state.effects.filter((effect) => effect.id !== effectId),
    })),

  setEffects: (effects: ActiveEffect[]) =>
    set({ effects }),

  getTimeRemaining: (effectId: string): number => {
    const effect = get().effects.find((e) => e.id === effectId);
    if (!effect) return 0;
    const expiresAtMs = new Date(effect.expires_at).getTime();
    const nowMs = Date.now();
    return Math.max(0, expiresAtMs - nowMs);
  },

  isExpired: (effectId: string): boolean => {
    const effect = get().effects.find((e) => e.id === effectId);
    if (!effect) return true;
    const expiresAtMs = new Date(effect.expires_at).getTime();
    return expiresAtMs <= Date.now();
  },
}));
