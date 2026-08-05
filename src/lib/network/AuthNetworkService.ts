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

  async registerEmail(body: { email: string; password: string; username?: string; captchaToken?: string }) {
    return apiFetch<{
      session?: { access_token: string; refresh_token: string };
      onboardingComplete?: boolean;
      error?: string;
    }>("/api/auth/email/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async loginEmail(body: { email: string; password: string }) {
    return apiFetch<{
      session?: { access_token: string; refresh_token: string };
      onboardingComplete?: boolean;
      error?: string;
    }>("/api/auth/email/login", {
      method: "POST",
      body: JSON.stringify(body),
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

  async completeOnboarding(body: {
    avatarId: string;
    username: string;
    campId?: string;
    referralCode?: string;
  }) {
    return apiFetch<unknown>("/api/auth/onboarding", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async checkUsername(username: string) {
    return apiFetch<{ available: boolean; error?: string }>(
      `/api/profile/username/check?username=${encodeURIComponent(username)}`
    );
  },

  async getCampOwnerCamp() {
    return apiFetch<unknown>("/api/camp-owner/camp");
  },

  async getProfile() {
    return apiFetch<unknown>("/api/profile");
  },

  async getProfileSessions() {
    return apiFetch<unknown>("/api/profile/sessions");
  },

  async logout() {
    return apiFetch<unknown>("/api/admin/auth/logout", { method: "POST" });
  },
};
