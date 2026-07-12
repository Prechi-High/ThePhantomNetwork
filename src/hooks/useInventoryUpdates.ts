"use client";

/**
 * useInventoryUpdates — Inventory Observer
 *
 * Domain: Inventory synchronization only.
 * Delivers skill/cosmetic/consumable changes → useInventoryStore.
 * Never updates UI. Never calculates gameplay.
 * Updates feel invisible — no reload, no flash.
 *
 * Architecture:
 *   Backend → SSE → useInventoryUpdates → useInventoryStore → HUD slot
 *
 * Features:
 *   - Initial bulk fetch on mount
 *   - SSE for real-time skill:available, skill:charged, skill:cooldown events
 *   - 8s polling fallback (intentionally slow — inventory rarely changes)
 *   - Independent failure mode
 */

import { useEffect, useRef } from "react";
import { useInventoryStore, type SkillInInventory } from "@/stores/useInventoryStore";

const POLL_INTERVAL_MS = 8_000;

interface InventoryResponse {
  skills: SkillInInventory[];
  server_time?: string;
}

export function useInventoryUpdates(
  userId: string | null,
  subSessionId: string | null,
) {
  const store = useInventoryStore();
  const sseRef      = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId || !subSessionId) return;

    // ── Initial fetch ────────────────────────────────────────────────────
    const fetchInventory = async () => {
      try {
        const res = await fetch(
          `/api/player/inventory?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!res.ok) return;
        const data = await res.json() as InventoryResponse;
        if (Array.isArray(data.skills)) {
          store.setSkills(data.skills);
        }
        if (data.server_time) {
          store.setServerTime(data.server_time);
        }
        store.markLoaded();
      } catch {/* independent failure */}
    };

    fetchInventory();

    // ── SSE subscription ─────────────────────────────────────────────────
    const es = new EventSource(`/api/realtime/${subSessionId}`);
    sseRef.current = es;

    const handleMessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data) as Record<string, unknown>;

        switch (event.type) {
          case "skill:available": {
            const p = event.payload as Record<string, unknown>;
            if (p?.skillId) store.updateSkillCooldown(p.skillId as string, 0);
            break;
          }
          case "skill:charged": {
            const p = event.payload as Record<string, unknown>;
            if (p?.skillId && p.charges !== undefined) {
              store.updateSkillCharges(p.skillId as string, Number(p.charges));
            }
            break;
          }
          case "skill:cooldown_started": {
            const p = event.payload as Record<string, unknown>;
            if (p?.skillId && p.cooldownMs !== undefined) {
              store.updateSkillCooldown(p.skillId as string, Number(p.cooldownMs));
            }
            break;
          }
          case "inventory:updated":
            // Full refresh trigger — re-fetch
            fetchInventory();
            break;
        }
      } catch {/* skip */}
    };

    es.addEventListener("skill:available",         handleMessage);
    es.addEventListener("skill:charged",           handleMessage);
    es.addEventListener("skill:cooldown_started",  handleMessage);
    es.addEventListener("inventory:updated",       handleMessage);
    es.onmessage = handleMessage;

    es.onerror = () => {
      // Start slow polling fallback
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(fetchInventory, POLL_INTERVAL_MS);
      }
      es.close();
    };

    return () => {
      es.close();
      sseRef.current = null;
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    };
  }, [userId, subSessionId, store]);
}
