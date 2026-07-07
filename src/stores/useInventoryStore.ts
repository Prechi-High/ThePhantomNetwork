import { create } from 'zustand';

interface SkillInInventory {
  id: string;
  name: string;
  owned: boolean;
  available: boolean;
  cooldown_ms: number;
  cooldown_until?: string;
  charges: number;
  max_charges: number;
  icon: string;
}

interface InventoryStore {
  skills: SkillInInventory[];
  serverTime: number;
  setSkills: (skills: SkillInInventory[]) => void;
  setServerTime: (time: number) => void;
  updateSkillCooldown: (skillId: string, cooldownUntil: string) => void;
  updateSkillCharges: (skillId: string, charges: number) => void;
  getSkillAvailability: (skillId: string) => boolean;
  getSkillCooldownRemaining: (skillId: string) => number;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  skills: [],
  serverTime: Date.now(),

  setSkills: (skills: SkillInInventory[]) => {
    set({ skills });
  },

  setServerTime: (time: number) => {
    set({ serverTime: time });
  },

  updateSkillCooldown: (skillId: string, cooldownUntil: string) => {
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === skillId
          ? { ...s, cooldown_until: cooldownUntil, available: false }
          : s
      ),
    }));
  },

  updateSkillCharges: (skillId: string, charges: number) => {
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === skillId ? { ...s, charges } : s
      ),
    }));
  },

  getSkillAvailability: (skillId: string) => {
    const state = get();
    const skill = state.skills.find((s) => s.id === skillId);
    if (!skill || !skill.owned) return false;
    if (!skill.cooldown_until) return true;

    const cooldownExpires = new Date(skill.cooldown_until).getTime();
    return state.serverTime > cooldownExpires;
  },

  getSkillCooldownRemaining: (skillId: string) => {
    const state = get();
    const skill = state.skills.find((s) => s.id === skillId);
    if (!skill || !skill.cooldown_until) return 0;

    const cooldownExpires = new Date(skill.cooldown_until).getTime();
    return Math.max(0, cooldownExpires - state.serverTime);
  },
}));
