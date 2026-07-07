import { create } from 'zustand';

interface ActiveEffect {
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
  serverTime: number;
  addEffect: (effect: ActiveEffect) => void;
  removeEffect: (effectId: string) => void;
  setEffects: (effects: ActiveEffect[]) => void;
  setServerTime: (time: number) => void;
  getTimeRemaining: (effect: ActiveEffect) => number;
  isExpired: (effect: ActiveEffect) => boolean;
}

export const useEffectsStore = create<EffectsStore>((set, get) => ({
  effects: [],
  serverTime: Date.now(),

  addEffect: (effect: ActiveEffect) => {
    set((state) => ({
      effects: [...state.effects, effect],
    }));
  },

  removeEffect: (effectId: string) => {
    set((state) => ({
      effects: state.effects.filter((e) => e.id !== effectId),
    }));
  },

  setEffects: (effects: ActiveEffect[]) => {
    set({ effects });
  },

  setServerTime: (time: number) => {
    set({ serverTime: time });
  },

  getTimeRemaining: (effect: ActiveEffect) => {
    const state = get();
    const expiresAtMs = new Date(effect.expires_at).getTime();
    return Math.max(0, expiresAtMs - state.serverTime);
  },

  isExpired: (effect: ActiveEffect) => {
    const state = get();
    const expiresAtMs = new Date(effect.expires_at).getTime();
    return state.serverTime > expiresAtMs;
  },
}));
