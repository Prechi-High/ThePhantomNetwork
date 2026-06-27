import { create } from "zustand";

interface SquadMember {
  userId: string;
  username: string;
  role: string;
}

interface SquadState {
  squad: { id: string; name: string; squad_tokens: number; member_count: number } | null;
  members: SquadMember[];
  tempSquadId: string | null;
  setSquad: (squad: SquadState["squad"]) => void;
  setMembers: (members: SquadMember[]) => void;
  setTempSquadId: (id: string | null) => void;
}

export const useSquadStore = create<SquadState>((set) => ({
  squad: null,
  members: [],
  tempSquadId: null,
  setSquad: (squad) => set({ squad }),
  setMembers: (members) => set({ members }),
  setTempSquadId: (tempSquadId) => set({ tempSquadId }),
}));
