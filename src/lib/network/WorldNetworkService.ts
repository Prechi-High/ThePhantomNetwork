/**
 * World / global feed network service.
 */

import { apiFetch } from "./client";

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
};
