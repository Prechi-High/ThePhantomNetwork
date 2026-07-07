import { create } from 'zustand';

export interface SkillInInventory {
  id: string;
  name: string;
  owned: boolean;
  available: boolean;
  cooldown_ms: number;
  cooldown_until: string | null;
  charges: number;
  max_charges: number;
  icon: string;
}

interface InventoryStore {
  skills: SkillInInventory[];
  serverTime: string;
  setSkills: (skills: SkillInInventory[]) => void;
  setServerTime: (time: string) => void;
  updateSkillCooldown: (skillId: string, cooldownMs: number) => void;
  updateSkillCharges: (skillId: string, charges: number) => void;
  getSkillAvailability: (skillId: string) => boolean;
  getSkillCooldownRemaining: (skillId: string) => number;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  skills: [],
  serverTime: new Date().toISOString(),

  setSkills: (skills: SkillInInventory[]) =>
    set({ skills }),

  setServerTime: (time: string) =>
    set({ serverTime: time }),

  updateSkillCooldown: (skillId: string, cooldownMs: number) =>
    set((state) => ({
      skills: state.skills.map((skill) => {
        if (skill.id === skillId) {
          if (cooldownMs === 0) {
            return { ...skill, available: true, cooldown_until: null };
          }
          const cooldownUntil = new Date(
            Date.now() + cooldownMs
          ).toISOString();
          return {
            ...skill,
            available: false,
            cooldown_ms: cooldownMs,
            cooldown_until: cooldownUntil,
          };
        }
        return skill;
      }),
    })),

  updateSkillCharges: (skillId: string, charges: number) =>
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === skillId ? { ...skill, charges } : skill
      ),
    })),

  getSkillAvailability: (skillId: string): boolean => {
    const skill = get().skills.find((s) => s.id === skillId);
    if (!skill) return false;
    if (!skill.owned) return false;
    return skill.available;
  },

  getSkillCooldownRemaining: (skillId: string): number => {
    const skill = get().skills.find((s) => s.id === skillId);
    if (!skill || !skill.cooldown_until) return 0;
    const cooldownUntilMs = new Date(skill.cooldown_until).getTime();
    const nowMs = Date.now();
    return Math.max(0, cooldownUntilMs - nowMs);
  },
}));
