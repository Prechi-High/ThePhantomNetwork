/**
 * World / global feed network service.
 */

import { apiFetch } from "./client";

export const worldNetwork = {
  async getLiveFeed() {
    return apiFetch<{ events?: unknown[] }>("/api/live-feed");
  },
};
