import { create } from 'zustand';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  session_tokens: number;
  squad_id?: string;
  squad_name?: string;
  alive: boolean;
  position: number;
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
  updateRank: (userId: string, rank: number, tokens: number) => void;
  updateSquadRank: (squadId: string, rank: number, tokens: number) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  individual: [],
  squad: [],

  updateIndividual: (entries: LeaderboardEntry[]) => {
    set({ individual: entries });
  },

  updateSquad: (entries: SquadLeaderboardEntry[]) => {
    set({ squad: entries });
  },

  updateRank: (userId: string, rank: number, tokens: number) => {
    set((state) => ({
      individual: state.individual.map((entry) =>
        entry.user_id === userId
          ? { ...entry, rank, session_tokens: tokens }
          : entry
      ),
    }));
  },

  updateSquadRank: (squadId: string, rank: number, tokens: number) => {
    set((state) => ({
      squad: state.squad.map((entry) =>
        entry.squad_id === squadId
          ? { ...entry, rank, squad_tokens: tokens }
          : entry
      ),
    }));
  },
}));
