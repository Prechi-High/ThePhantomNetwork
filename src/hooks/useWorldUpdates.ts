"use client";

/**
 * useWorldUpdates — Living World Subscription Hook
 *
 * Fetches and maintains all world-layer data:
 *   - World timeline / history
 *   - World statistics (population signals)
 *   - Camp momentum
 *   - Active world events
 *   - Player rivalries
 *   - Return summary (what happened while away)
 *   - Daily features
 *
 * Independent failure — world degrades without breaking gameplay.
 * Refresh strategy:
 *   - Initial fetch on mount
 *   - World stats: every 30s (lightweight)
 *   - World history: every 60s
 *   - Camp momentum: every 2min
 *   - World events: every 5min
 */

import { useCallback, useEffect, useRef } from "react";
import { useWorldStore }   from "@/stores/useWorldStore";
import type { WorldStats, WorldHistoryEntry } from "@/lib/world/worldTimeline";
import type { CampMomentumEntry }             from "@/lib/world/campMomentum";
import type { WorldEvent }                    from "@/lib/world/worldEvents";
import type { RivalryRecord }                 from "@/lib/world/rivalrySystem";
import type { PlayerReputation }              from "@/lib/world/reputationEngine";

interface WorldSummaryResponse {
  stats?:        WorldStats;
  history?:      WorldHistoryEntry[];
  campMomentum?: CampMomentumEntry[];
  worldEvents?:  WorldEvent[];
  rivalries?:    RivalryRecord[];
  reputation?:   PlayerReputation;
  returnSummary?: {
    lastSeenAt:             number;
    sessionsCompleted:      number;
    campRankChange:         number;
    rivalWins:              number;
    squadMembersRankedUp:   string[];
    worldAnnouncements:     WorldHistoryEntry[];
    worldRecords:           WorldHistoryEntry[];
  };
  dailyFeature?: {
    featuredCamp?:      { id: string; name: string; momentum: number };
    featuredSquad?:     { id: string; name: string; tokens: number };
    topRivalry?:        { playerA: string; playerB: string; score: string };
    playerSpotlight?:   { userId: string; username: string; achievement: string };
    communityChallenge?:{ title: string; description: string; progress: number };
  };
}

const STATS_INTERVAL_MS    = 30_000;
const HISTORY_INTERVAL_MS  = 60_000;
const CAMPS_INTERVAL_MS    = 120_000;
const EVENTS_INTERVAL_MS   = 300_000;

export function useWorldUpdates(userId?: string | null) {
  const store = useWorldStore();
  const statsTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const campsTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Full world bootstrap ─────────────────────────────────────────────

  const fetchWorldSummary = useCallback(async () => {
    try {
      const url = userId
        ? `/api/world/summary?userId=${userId}`
        : `/api/world/summary`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json() as WorldSummaryResponse;

      if (data.stats)        store.setWorldStats(data.stats);
      if (data.history)      store.setWorldHistory(data.history);
      if (data.campMomentum) store.setCampMomentum(data.campMomentum);
      if (data.worldEvents)  store.setWorldEvents(data.worldEvents);
      if (data.rivalries)    store.setRivalries(data.rivalries);
      if (data.reputation)   store.setMyReputation(data.reputation);
      if (data.dailyFeature) store.setDailyFeature(data.dailyFeature);
      if (data.returnSummary) {
        store.setReturnSummary({ ...data.returnSummary, isReady: true });
      }
      store.markWorldLoaded();
    } catch {/* world degrades gracefully */}
  }, [userId, store]);

  // ── Individual refresh functions ─────────────────────────────────────

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/world/stats");
      if (!res.ok) return;
      const data = await res.json() as { stats?: WorldStats };
      if (data.stats) store.setWorldStats(data.stats);
    } catch {/* silent */}
  }, [store]);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/world/history?limit=30");
      if (!res.ok) return;
      const data = await res.json() as { history?: WorldHistoryEntry[] };
      if (data.history) store.setWorldHistory(data.history);
    } catch {/* silent */}
  }, [store]);

  const refreshCamps = useCallback(async () => {
    try {
      const res = await fetch("/api/world/camps");
      if (!res.ok) return;
      const data = await res.json() as { camps?: CampMomentumEntry[] };
      if (data.camps) store.setCampMomentum(data.camps);
    } catch {/* silent */}
  }, [store]);

  const refreshEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/world/events");
      if (!res.ok) return;
      const data = await res.json() as { events?: WorldEvent[] };
      if (data.events) store.setWorldEvents(data.events);
    } catch {/* silent */}
  }, [store]);

  // ── Mount ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchWorldSummary();

    statsTimer.current   = setInterval(refreshStats,   STATS_INTERVAL_MS);
    historyTimer.current = setInterval(refreshHistory, HISTORY_INTERVAL_MS);
    campsTimer.current   = setInterval(refreshCamps,   CAMPS_INTERVAL_MS);
    eventsTimer.current  = setInterval(refreshEvents,  EVENTS_INTERVAL_MS);

    return () => {
      if (statsTimer.current)   clearInterval(statsTimer.current);
      if (historyTimer.current) clearInterval(historyTimer.current);
      if (campsTimer.current)   clearInterval(campsTimer.current);
      if (eventsTimer.current)  clearInterval(eventsTimer.current);
    };
  }, [fetchWorldSummary, refreshStats, refreshHistory, refreshCamps, refreshEvents]);
}
