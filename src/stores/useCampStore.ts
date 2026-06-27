import { create } from "zustand";

interface CampState {
  camp: { id: string; name: string; member_count: number; leaderboard_score: number } | null;
  setCamp: (camp: CampState["camp"]) => void;
}

export const useCampStore = create<CampState>((set) => ({
  camp: null,
  setCamp: (camp) => set({ camp }),
}));
