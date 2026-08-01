/**
 * Auth Network Service — authentication, onboarding, profile.
 */

import { apiFetch } from "./client";

export const authNetwork = {
  async getMe() {
    return apiFetch<{ role?: string; user?: unknown }>("/api/auth/me");
  },

  async loginTelegram(initData: string) {
    return apiFetch<unknown>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  },

  async verifyCaptcha(token: string) {
    return apiFetch<unknown>("/api/auth/captcha", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async devLogin() {
    return apiFetch<unknown>("/api/auth/dev", { method: "POST" });
  },

  async establishSession(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/auth/session", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async completeOnboarding(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/auth/onboarding", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getCampOwnerCamp() {
    return apiFetch<unknown>("/api/camp-owner/camp");
  },

  async getProfile() {
    return apiFetch<unknown>("/api/profile");
  },

  async logout() {
    return apiFetch<unknown>("/api/admin/auth/logout", { method: "POST" });
  },
};
