/**
 * Camps Network Service — camp details, leaderboard, switch.
 */

import { apiFetch } from "./client";

export const campsNetwork = {
  async getCamp(id: string) {
    return apiFetch<{ camp?: Record<string, unknown> }>(`/api/camps/${id}`);
  },

  async getCampLeaderboard(id: string) {
    return apiFetch<{ leaderboard?: Record<string, unknown>[] }>(
      `/api/camps/${id}/leaderboard`
    );
  },

  async switchCamp(campId: string) {
    return apiFetch<unknown>("/api/camps/switch", {
      method: "POST",
      body: JSON.stringify({ campId }),
    });
  },
};
