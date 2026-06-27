import { create } from "zustand";
import type { Database } from "@/types/database";

type Session = Database["public"]["Tables"]["sessions"]["Row"];

interface SessionState {
  currentSession: Session | null;
  subSessionId: string | null;
  isRegistered: boolean;
  poolCents: number;
  setCurrentSession: (session: Session | null) => void;
  setSubSessionId: (id: string | null) => void;
  setRegistered: (registered: boolean) => void;
  setPoolCents: (cents: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  subSessionId: null,
  isRegistered: false,
  poolCents: 0,
  setCurrentSession: (currentSession) => set({ currentSession }),
  setSubSessionId: (subSessionId) => set({ subSessionId }),
  setRegistered: (isRegistered) => set({ isRegistered }),
  setPoolCents: (poolCents) => set({ poolCents }),
}));
