import { create } from 'zustand';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  session_tokens: number;
  squad_id: string;
  squad_name: string;
  alive: boolean;
  position: { x: number; y: number };
}

export interface SquadLeaderboardEntry {
  rank: number;
  squad_id: string;
  squad_name: string;
  squad_tokens: number;
  member_count: number;
  leader_name: string;
}

interface LeaderboardStore {
  individual: LeaderboardEntry[];
  squad: SquadLeaderboardEntry[];
  updateIndividual: (entries: LeaderboardEntry[]) => void;
  updateSquad: (entries: SquadLeaderboardEntry[]) => void;
  updateRank: (userId: string, newRank: number) => void;
  updateSquadRank: (squadId: string, newRank: number) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  individual: [],
  squad: [],

  updateIndividual: (entries: LeaderboardEntry[]) =>
    set({ individual: entries }),

  updateSquad: (entries: SquadLeaderboardEntry[]) =>
    set({ squad: entries }),

  updateRank: (userId: string, newRank: number) =>
    set((state) => ({
      individual: state.individual.map((entry) =>
        entry.user_id === userId ? { ...entry, rank: newRank } : entry
      ),
    })),

  updateSquadRank: (squadId: string, newRank: number) =>
    set((state) => ({
      squad: state.squad.map((entry) =>
        entry.squad_id === squadId ? { ...entry, rank: newRank } : entry
      ),
    })),
}));
