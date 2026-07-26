"use client";

/**
 * useEffectsUpdates — Temporary Effects Observer
 *
 * Domain: Effects synchronization only.
 * Delivers effect:activated / effect:expired → useEffectsStore.
 * Never updates UI. Never calculates gameplay.
 *
 * Architecture:
 *   Backend → SSE → useEffectsUpdates → useEffectsStore → HUD
 *
 * Features:
 *   - Initial fetch on mount
 *   - SSE for real-time activate/expire events
 *   - Cleanup loop every 2s (clears locally expired effects)
 *   - Fully independent — gameplay never fails if this hook fails
 */

import { useEffect, useRef } from "react";
import { useEffectsStore, type ActiveEffect } from "@/stores/useEffectsStore";

const CLEANUP_INTERVAL_MS = 2_000;

interface EffectsResponse {
  effects: ActiveEffect[];
  server_time?: string;
}

export function useEffectsUpdates(
  userId: string | null,
  subSessionId: string | null,
) {
  const sseRef      = useRef<EventSource | null>(null);
  const cleanupRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId || !subSessionId) return;

    const isForCurrentUser = (eventUserId: unknown) =>
      !eventUserId || eventUserId === userId;

    // ── Initial fetch ────────────────────────────────────────────────────
    const fetchEffects = async () => {
      try {
        const res = await fetch(
          `/api/player/effects?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!res.ok) return;
        const data = await res.json() as EffectsResponse;
        if (Array.isArray(data.effects)) {
          useEffectsStore.getState().setEffects(data.effects);
        }
      } catch {/* independent failure — gameplay continues */}
    };

    fetchEffects();

    // ── SSE subscription ─────────────────────────────────────────────────
    const es = new EventSource(`/api/realtime/${subSessionId}`);
    sseRef.current = es;

    const handleMessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data) as Record<string, unknown>;
        const { addEffect, removeEffect } = useEffectsStore.getState();

        if (event.type === "effect:activated" && event.payload) {
          if (!isForCurrentUser(event.userId)) return;
          addEffect(event.payload as ActiveEffect);
          return;
        }
        if (event.type === "effect:expired") {
          if (!isForCurrentUser(event.userId)) return;
          const payload = event.payload as Record<string, unknown>;
          if (payload?.effectId) removeEffect(payload.effectId as string);
          return;
        }
        // Fallback: SSE message channel
        if (
          event.type === "effect_applied" ||
          event.type === "effect_activated"
        ) {
          if (!isForCurrentUser(event.userId)) return;
          const payload = event.payload as ActiveEffect | undefined;
          if (payload?.id) addEffect(payload);
        }
      } catch {/* skip malformed event */}
    };

    es.onmessage = handleMessage;
    es.onerror = () => {
      // Degrade silently — cleanup loop keeps expired effects cleared
      es.close();
    };

    // ── Expiry cleanup loop ──────────────────────────────────────────────
    cleanupRef.current = setInterval(() => {
      useEffectsStore.getState().clearExpired();
    }, CLEANUP_INTERVAL_MS);

    return () => {
      es.close();
      sseRef.current = null;
      if (cleanupRef.current) clearInterval(cleanupRef.current);
    };
  }, [userId, subSessionId]);
}
