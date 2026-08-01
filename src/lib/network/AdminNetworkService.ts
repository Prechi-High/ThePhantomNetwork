/**
 * Admin Network Service — admin panel endpoints.
 */

import { apiFetch } from "./client";

export const adminNetwork = {
  async getSessions() {
    return apiFetch<unknown>("/api/admin/sessions");
  },

  async createSession(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateSession(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/sessions", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async getSession(id: string) {
    return apiFetch<unknown>(`/api/admin/sessions/${id}`);
  },

  async patchSession(id: string, body: Record<string, unknown>) {
    return apiFetch<unknown>(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async deleteSession(id: string) {
    return apiFetch<unknown>(`/api/admin/sessions/${id}`, {
      method: "DELETE",
    });
  },

  async getUsers(params?: string) {
    return apiFetch<unknown>(`/api/admin/users${params ? `?${params}` : ""}`);
  },

  async patchUser(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async getCamps() {
    return apiFetch<unknown>("/api/admin/camps");
  },

  async createCamp(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/camps", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async patchCamp(id: string, body: Record<string, unknown>) {
    return apiFetch<unknown>(`/api/admin/camps/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async getAnalytics() {
    return apiFetch<unknown>("/api/admin/analytics");
  },

  async getErrors(params?: string) {
    return apiFetch<unknown>(`/api/admin/errors${params ? `?${params}` : ""}`);
  },

  async deleteErrors(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/errors", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  },

  async login(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async logout() {
    return apiFetch<unknown>("/api/admin/auth/logout", { method: "POST" });
  },

  async getConfig() {
    return apiFetch<unknown>("/api/admin/config");
  },

  async patchConfig(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/admin/config", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};
