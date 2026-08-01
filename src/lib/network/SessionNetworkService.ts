/**
 * Session Network Service — sessions, practice, join.
 */

import { apiFetch } from "./client";

export const sessionNetwork = {
  async listSessions() {
    return apiFetch<{ sessions?: unknown[] }>("/api/sessions");
  },

  async getSession(id: string) {
    return apiFetch<unknown>(`/api/sessions/${id}`);
  },

  async joinSession(sessionId: string) {
    return apiFetch<unknown>(`/api/sessions/${sessionId}/join`, {
      method: "POST",
    });
  },

  async getMySubSession(sessionId: string) {
    return apiFetch<{ subSessionId?: string }>(
      `/api/sessions/${sessionId}/my-sub-session`
    );
  },

  async getSubSessions(sessionId: string) {
    return apiFetch<unknown>(`/api/sessions/${sessionId}/sub-sessions`);
  },

  async createPractice(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/sessions/practice/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async createSolo(body: Record<string, unknown>) {
    return apiFetch<unknown>("/api/sessions/solo/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
