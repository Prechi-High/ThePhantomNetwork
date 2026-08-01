/**
 * Layout Network Service — HUD layout editor endpoints.
 */

import { apiFetch } from "./client";

export const layoutNetwork = {
  async getActiveLayout() {
    return apiFetch<unknown>("/api/layouts/active");
  },

  async saveUserLayout(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/layouts/user", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async deleteUserLayout(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/layouts/user", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  },

  async saveGlobalLayout(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/layouts/global", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getGlobalHistory(params?: string) {
    return apiFetch<unknown>(`/api/layouts/global/history${params ? `?${params}` : ""}`);
  },

  async restoreGlobalLayout(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/layouts/global/restore", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
