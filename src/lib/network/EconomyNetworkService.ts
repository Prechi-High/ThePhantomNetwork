/**
 * Economy Network Service — wallet, shop, armory.
 */

import { apiFetch } from "./client";

export const economyNetwork = {
  async getWallet() {
    return apiFetch<{ balance?: number }>("/api/wallet");
  },

  async deposit(amountCents: number) {
    return apiFetch<{ clientSecret?: string; error?: string }>("/api/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amountCents }),
    });
  },

  async devCredit(amountCents: number) {
    return apiFetch<unknown>("/api/wallet/dev-credit", {
      method: "POST",
      body: JSON.stringify({ amountCents }),
    });
  },

  async getShop() {
    return apiFetch<unknown>("/api/shop");
  },

  async purchaseShop(
    itemId: string,
    options?: { sessionId?: string | null; squadId?: string | null }
  ) {
    return apiFetch<unknown>("/api/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId, ...options }),
    });
  },

  async getArmoryInventory() {
    return apiFetch<unknown>("/api/armory/inventory");
  },

  async getArmoryShop() {
    return apiFetch<unknown>("/api/armory/purchase");
  },

  async getArmoryLoadouts() {
    return apiFetch<unknown>("/api/armory/loadouts");
  },

  async saveArmoryLoadout(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/armory/loadouts", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async purchaseArmory(itemId: string, quantity = 1) {
    return apiFetch<unknown>("/api/armory/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    });
  },
};
