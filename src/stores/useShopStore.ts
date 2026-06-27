import { create } from "zustand";

interface ShopItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  economy: string;
  price_cents: number | null;
  price_squad_tokens: number | null;
  level_required: number;
}

interface ShopState {
  items: ShopItem[];
  cart: string[];
  isLocked: boolean;
  setItems: (items: ShopItem[]) => void;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  setLocked: (locked: boolean) => void;
  clearCart: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  items: [],
  cart: [],
  isLocked: false,
  setItems: (items) => set({ items }),
  addToCart: (itemId) => set((s) => ({ cart: [...s.cart, itemId] })),
  removeFromCart: (itemId) =>
    set((s) => ({ cart: s.cart.filter((id) => id !== itemId) })),
  setLocked: (isLocked) => set({ isLocked }),
  clearCart: () => set({ cart: [] }),
}));
