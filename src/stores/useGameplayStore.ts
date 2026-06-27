import { create } from "zustand";
import type { SpinOutcome } from "@/types/gameplay";

interface GameplayState {
  phase: number;
  round: number;
  tokens: number;
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  isEliminated: boolean;
  isRevivable: boolean;
  setPhase: (phase: number) => void;
  setRound: (round: number) => void;
  setTokens: (tokens: number) => void;
  setSpinning: (spinning: boolean) => void;
  setSpinLocked: (locked: boolean) => void;
  setLastOutcome: (outcome: SpinOutcome | null) => void;
  setEliminated: (eliminated: boolean) => void;
  setRevivable: (revivable: boolean) => void;
}

export const useGameplayStore = create<GameplayState>((set) => ({
  phase: 0,
  round: 0,
  tokens: 0,
  isSpinning: false,
  spinLocked: false,
  lastOutcome: null,
  isEliminated: false,
  isRevivable: false,
  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setTokens: (tokens) => set({ tokens }),
  setSpinning: (isSpinning) => set({ isSpinning }),
  setSpinLocked: (spinLocked) => set({ spinLocked }),
  setLastOutcome: (lastOutcome) => set({ lastOutcome }),
  setEliminated: (isEliminated) => set({ isEliminated }),
  setRevivable: (isRevivable) => set({ isRevivable }),
}));
