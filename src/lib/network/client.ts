/**
 * Network client — shared fetch utilities.
 */

import { NetworkError, type ApiResult } from "./types";

export async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      data = {} as T;
    }

    if (!res.ok) {
      const message =
        (data as { error?: string })?.error ??
        `Request failed (${res.status})`;
      return {
        ok: false,
        error: new NetworkError(message, res.status, data),
      };
    }

    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed";
    return {
      ok: false,
      error: new NetworkError(message, 0),
    };
  }
}

/** Fire request without blocking caller — invokes callbacks on completion */
export function apiFetchBackground<T>(
  url: string,
  init: RequestInit | undefined,
  handlers: {
    onSuccess: (data: T) => void;
    onError: (error: NetworkError) => void;
  }
): void {
  void apiFetch<T>(url, init).then((result) => {
    if (result.ok) handlers.onSuccess(result.data);
    else handlers.onError(result.error);
  });
}
