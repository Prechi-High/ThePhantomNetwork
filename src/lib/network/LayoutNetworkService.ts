/**
 * Layout Network Service — HUD layout editor endpoints.
 */

import { apiFetch } from "./client";
import type { ApiResult } from "./types";

type LayoutEnvelope<T> = { success?: boolean; data?: T; message?: string };

function unwrapLayoutPayload<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    const envelope = body as LayoutEnvelope<T>;
    if (envelope.data !== undefined) return envelope.data;
  }
  return body as T;
}

async function layoutFetch<T>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const result = await apiFetch<unknown>(url, init);
  if (!result.ok) return result;
  return { ok: true, data: unwrapLayoutPayload<T>(result.data) };
}

export const layoutNetwork = {
  async getActiveLayout() {
    return layoutFetch<unknown>("/api/layouts/active");
  },

  async saveUserLayout(body: Record<string, unknown>) {
    return layoutFetch<unknown>("/api/layouts/user", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async deleteUserLayout(body: Record<string, unknown>) {
    return layoutFetch<unknown>("/api/layouts/user", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  },

  async saveGlobalLayout(body: Record<string, unknown>) {
    return layoutFetch<unknown>("/api/layouts/global", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getGlobalHistory(params?: string) {
    return layoutFetch<unknown>(
      `/api/layouts/global/history${params ? `?${params}` : ""}`
    );
  },

  async restoreGlobalLayout(body: Record<string, unknown>) {
    return layoutFetch<unknown>("/api/layouts/global/restore", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
