/**
 * useInventoryStore — The Backpack
 *
 * Domain: Everything the player owns.
 * Owns: skills, consumables, boosters, owned cosmetics, equipped cosmetics,
 *       voice packs, wheel skins, border skins.
 * Never owns: gameplay decisions, session state, effects state.
 *
 * Persistent data — survives session changes.
 * Independent failure — gameplay continues if inventory is delayed.
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SkillInInventory {
  id: string;
  name: string;
  sku?: string;
  owned: boolean;
  available: boolean;
  cooldown_ms: number;
  cooldown_until: string | null;
  charges: number;
  max_charges: number;
  icon: string;
  description?: string;
  category?: "combat" | "defense" | "utility" | "premium";
}

export interface Consumable {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  icon: string;
  description?: string;
}

export interface CosmeticItem {
  id: string;
  sku: string;
  name: string;
  type: "wheel_skin" | "avatar_border" | "voice_pack" | "trail" | "badge";
  equipped: boolean;
  previewUrl?: string;
}

// ── State ──────────────────────────────────────────────────────────────────

interface InventoryStoreState {
  skills: SkillInInventory[];
  consumables: Consumable[];
  cosmetics: CosmeticItem[];
  serverTime: string;
  isLoaded: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface InventoryStoreActions {
  // Bulk setters (from server sync)
  setSkills:      (skills: SkillInInventory[]) => void;
  setConsumables: (consumables: Consumable[]) => void;
  setCosmetics:   (cosmetics: CosmeticItem[]) => void;
  setServerTime:  (time: string) => void;
  markLoaded:     () => void;

  // Skill commands
  updateSkillCooldown: (skillId: string, cooldownMs: number) => void;
  updateSkillCharges:  (skillId: string, charges: number) => void;

  // Consumable commands
  consumeItem: (sku: string, qty?: number) => void;

  // Cosmetic commands
  equipCosmetic:   (cosmeticId: string) => void;
  unequipCosmetic: (cosmeticId: string) => void;

  // Queries
  getSkillAvailability:    (skillId: string) => boolean;
  getSkillCooldownRemaining: (skillId: string) => number;
  getEquippedCosmetic:     (type: CosmeticItem["type"]) => CosmeticItem | undefined;

  // Recovery
  resetInventory: () => void;
}

type InventoryStore = InventoryStoreState & InventoryStoreActions;

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL: InventoryStoreState = {
  skills:      [],
  consumables: [],
  cosmetics:   [],
  serverTime:  new Date().toISOString(),
  isLoaded:    false,
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  ...INITIAL,

  // ---- Bulk setters ----

  setSkills:      (skills)      => set({ skills }),
  setConsumables: (consumables) => set({ consumables }),
  setCosmetics:   (cosmetics)   => set({ cosmetics }),
  setServerTime:  (serverTime)  => set({ serverTime }),
  markLoaded:     ()            => set({ isLoaded: true }),

  // ---- Skill commands ----

  updateSkillCooldown: (skillId, cooldownMs) =>
    set((s) => ({
      skills: s.skills.map((sk) => {
        if (sk.id !== skillId) return sk;
        if (cooldownMs <= 0) return { ...sk, available: true, cooldown_until: null };
        return {
          ...sk,
          available: false,
          cooldown_ms: cooldownMs,
          cooldown_until: new Date(Date.now() + cooldownMs).toISOString(),
        };
      }),
    })),

  updateSkillCharges: (skillId, charges) =>
    set((s) => ({
      skills: s.skills.map((sk) =>
        sk.id === skillId
          ? { ...sk, charges, available: charges > 0 && !sk.cooldown_until }
          : sk
      ),
    })),

  // ---- Consumables ----

  consumeItem: (sku, qty = 1) =>
    set((s) => ({
      consumables: s.consumables.map((c) =>
        c.sku === sku
          ? { ...c, quantity: Math.max(0, c.quantity - qty) }
          : c
      ),
    })),

  // ---- Cosmetics ----

  equipCosmetic: (cosmeticId) =>
    set((s) => {
      const target = s.cosmetics.find(c => c.id === cosmeticId);
      if (!target) return s;
      return {
        cosmetics: s.cosmetics.map(c =>
          c.type === target.type
            ? { ...c, equipped: c.id === cosmeticId }
            : c
        ),
      };
    }),

  unequipCosmetic: (cosmeticId) =>
    set((s) => ({
      cosmetics: s.cosmetics.map(c =>
        c.id === cosmeticId ? { ...c, equipped: false } : c
      ),
    })),

  // ---- Queries ----

  getSkillAvailability: (skillId) => {
    const sk = get().skills.find(s => s.id === skillId);
    if (!sk || !sk.owned) return false;
    if (sk.charges <= 0) return false;
    if (!sk.available) return false;
    if (sk.cooldown_until && new Date(sk.cooldown_until).getTime() > Date.now()) return false;
    return true;
  },

  getSkillCooldownRemaining: (skillId) => {
    const sk = get().skills.find(s => s.id === skillId);
    if (!sk?.cooldown_until) return 0;
    return Math.max(0, new Date(sk.cooldown_until).getTime() - Date.now());
  },

  getEquippedCosmetic: (type) =>
    get().cosmetics.find(c => c.type === type && c.equipped),

  // ---- Reset ----

  resetInventory: () => set({ ...INITIAL }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectSkills = (s: InventoryStore) => s.skills;
export const selectAvailableSkills = (s: InventoryStore) =>
  s.skills.filter(sk => sk.owned && sk.charges > 0);
export const selectConsumables = (s: InventoryStore) => s.consumables;
export const selectCosmetics = (s: InventoryStore) => s.cosmetics;
export const selectInventoryLoaded = (s: InventoryStore) => s.isLoaded;
