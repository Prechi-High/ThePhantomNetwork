import { create } from "zustand";
import type { StealTarget } from "@/types/gameplay";

interface StealState {
  targets: StealTarget[];
  selectedTarget: StealTarget | null;
  fireBoostTaps: number;
  fireBoostMax: number;
  stealInProgress: boolean;
  attackerId: string | null;
  setTargets: (targets: StealTarget[]) => void;
  setSelectedTarget: (target: StealTarget | null) => void;
  incrementFireBoost: () => void;
  resetFireBoost: () => void;
  setStealInProgress: (inProgress: boolean, attackerId?: string | null) => void;
}

export const useStealStore = create<StealState>((set) => ({
  targets: [],
  selectedTarget: null,
  fireBoostTaps: 0,
  fireBoostMax: 5,
  stealInProgress: false,
  attackerId: null,
  setTargets: (targets) => set({ targets }),
  setSelectedTarget: (selectedTarget) => set({ selectedTarget }),
  incrementFireBoost: () =>
    set((s) => ({
      fireBoostTaps: Math.min(s.fireBoostTaps + 1, s.fireBoostMax),
    })),
  resetFireBoost: () => set({ fireBoostTaps: 0 }),
  setStealInProgress: (stealInProgress, attackerId = null) =>
    set({ stealInProgress, attackerId }),
}));
