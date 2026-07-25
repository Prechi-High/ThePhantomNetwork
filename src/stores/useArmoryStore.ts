import { create } from "zustand";
import type { TacticalAssetSlug } from "@/types/gameplay";

export interface ArmoryShopItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  assetSlug: TacticalAssetSlug;
}

export interface InventoryRow {
  assetSlug: TacticalAssetSlug;
  quantity: number;
}

export interface LoadoutRow {
  id: string;
  name: string;
  isActive: boolean;
  items: { assetSlug: TacticalAssetSlug; quantity: number }[];
}

interface ArmoryState {
  legacyCredits: number;
  inventory: InventoryRow[];
  loadouts: LoadoutRow[];
  shopItems: ArmoryShopItem[];
  isLocked: boolean;
  setLegacyCredits: (n: number) => void;
  setInventory: (inv: InventoryRow[]) => void;
  setLoadouts: (loadouts: LoadoutRow[]) => void;
  setShopItems: (items: ArmoryShopItem[]) => void;
  setLocked: (locked: boolean) => void;
}

export const useArmoryStore = create<ArmoryState>((set) => ({
  legacyCredits: 0,
  inventory: [],
  loadouts: [],
  shopItems: [],
  isLocked: false,
  setLegacyCredits: (legacyCredits) => set({ legacyCredits }),
  setInventory: (inventory) => set({ inventory }),
  setLoadouts: (loadouts) => set({ loadouts }),
  setShopItems: (shopItems) => set({ shopItems }),
  setLocked: (isLocked) => set({ isLocked }),
}));
