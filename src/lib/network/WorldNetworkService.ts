/**
 * World / global feed network service.
 */

import { apiFetch } from "./client";
import type { WorldStats } from "@/lib/world/worldTimeline";
import type { CampMomentumEntry } from "@/lib/world/campMomentum";

export const worldNetwork = {
  async getLiveFeed() {
    return apiFetch<{ events?: unknown[] }>("/api/live-feed");
  },

  async getRivals() {
    return apiFetch<unknown>("/api/rivals");
  },

  async getPlayedWith() {
    return apiFetch<unknown>("/api/social/played-with");
  },

  async getSummary() {
    return apiFetch<{
      stats?: WorldStats;
      campMomentum?: CampMomentumEntry[];
    }>("/api/world/summary");
  },
};
