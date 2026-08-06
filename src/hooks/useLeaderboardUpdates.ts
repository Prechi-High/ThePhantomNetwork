"use client";

/**
 * useLeaderboardUpdates — Streaming Rankings Observer
 *
 * Domain: Leaderboard synchronization only.
 * Delivers rank/score changes → useLeaderboardStore.
 * Uses incremental updates — only changed rows animate.
 * Never updates UI directly. Never calculates gameplay.
 *
 * Strategy:
 *   - Initial bulk fetch on mount
 *   - SSE for incremental rank/token changes
 *   - 5s polling fallback if SSE fails
 *   - Marks stale on connection loss, fresh on restore
 */

import { useEffect, useRef } from "react";
import {
  useLeaderboardStore,
  type LeaderboardEntry,
  type SquadLeaderboardEntry,
} from "@/stores/useLeaderboardStore";
import { interactionController } from "@/lib/motion/InteractionController";

const POLL_INTERVAL_MS = 5_000;

function maybePlaySquadTakesLead(
  mySquadId: string | null | undefined,
  squadId: string,
  newRank: number,
  prevRank: number | null
): void {
  if (!mySquadId || squadId !== mySquadId) return;
  if (newRank === 1 && prevRank !== 1) {
    interactionController.playEffect("squad_takes_lead");
  }
}

export function useLeaderboardUpdates(
  subSessionId: string | null,
  mySquadId?: string | null
) {
  const store = useLeaderboardStore();
  const sseRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mySquadIdRef = useRef(mySquadId ?? null);
  mySquadIdRef.current = mySquadId ?? null;

  // ── Bulk fetch (initial + polling fallback) ────────────────────────────

  const fetchBulk = async () => {
    if (!subSessionId) return;
    try {
      const [iRes, sRes] = await Promise.allSettled([
        fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=individual`),
        fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=squad`),
      ]);

      if (iRes.status === "fulfilled" && iRes.value.ok) {
        const data = await iRes.value.json() as { leaderboard?: LeaderboardEntry[] };
        if (Array.isArray(data.leaderboard)) {
          store.updateIndividual(data.leaderboard);
        }
      }

      if (sRes.status === "fulfilled" && sRes.value.ok) {
        const data = await sRes.value.json() as { squad_leaderboard?: SquadLeaderboardEntry[] };
        if (Array.isArray(data.squad_leaderboard)) {
          const squadId = mySquadIdRef.current;
          const prevRank = squadId
            ? store.squad.find((e) => e.squad_id === squadId)?.rank ?? null
            : null;
          store.updateSquad(data.squad_leaderboard);
          if (squadId) {
            const newRank =
              data.squad_leaderboard.find((e) => e.squad_id === squadId)?.rank ?? null;
            if (newRank != null) {
              maybePlaySquadTakesLead(squadId, squadId, newRank, prevRank);
            }
          }
        }
      }

      store.markFresh();
    } catch {
      store.markStale();
    }
  };

  // ── SSE incremental handler ────────────────────────────────────────────

  const handleMessage = (e: MessageEvent) => {
    try {
      const event = JSON.parse(e.data) as Record<string, unknown>;

      switch (event.type) {
        case "leaderboard:updated": {
          const p = event.payload as Record<string, unknown>;
          if (p?.event === "rank_changed" && p.user_id) {
            store.updateRank(p.user_id as string, Number(p.new_rank));
          } else if (p?.event === "tokens_changed" && p.user_id) {
            store.updateTokens(p.user_id as string, Number(p.tokens));
          } else if (p?.event === "eliminated" && p.user_id) {
            store.markEliminated(p.user_id as string);
          }
          break;
        }
        case "squad_leaderboard:rank_changed": {
          const p = event.payload as Record<string, unknown>;
          if (p?.squad_id) {
            const squadId = p.squad_id as string;
            const newRank = Number(p.new_rank);
            const prevRank =
              store.squad.find((e) => e.squad_id === squadId)?.rank ?? null;
            store.updateSquadRank(squadId, newRank);
            maybePlaySquadTakesLead(mySquadIdRef.current, squadId, newRank, prevRank);
          }
          break;
        }
        case "squad_leaderboard:tokens_changed": {
          const p = event.payload as Record<string, unknown>;
          if (p?.squad_id) store.updateSquadTokens(p.squad_id as string, Number(p.tokens));
          break;
        }
      }
    } catch {/* parse error — skip */}
  };

  // ── SSE subscription ───────────────────────────────────────────────────

  useEffect(() => {
    if (!subSessionId) return;

    fetchBulk();

    const es = new EventSource(`/api/realtime/${subSessionId}`);
    sseRef.current = es;

    es.onopen = () => {
      store.markFresh();
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    };

    es.addEventListener("leaderboard:updated", handleMessage);
    es.addEventListener("squad_leaderboard:rank_changed", handleMessage);
    es.addEventListener("squad_leaderboard:tokens_changed", handleMessage);
    es.onmessage = handleMessage;

    es.onerror = () => {
      store.markStale();
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(fetchBulk, POLL_INTERVAL_MS);
      }
    };

    return () => {
      es.close();
      sseRef.current = null;
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subSessionId]);
}
