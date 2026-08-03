/**
 * Squads Network Service
 */

import { apiFetch } from "./client";

export const squadsNetwork = {
  async listSquads() {
    return apiFetch<unknown>("/api/squads");
  },

  async getSquad(id: string) {
    return apiFetch<unknown>(`/api/squads/${id}`);
  },

  async getLeaderboard() {
    return apiFetch<unknown>("/api/squads/leaderboard");
  },
};
