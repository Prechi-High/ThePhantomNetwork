import { create } from "zustand";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  captchaVerified: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setCaptchaVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  captchaVerified: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setCaptchaVerified: (captchaVerified) => set({ captchaVerified }),
}));
