"use client";

/**
 * useLiveFeedUpdates — World Activity Subscriber
 *
 * Domain: Live feed subscription and spam filtering only.
 * Delivers world events → Runtime → useLiveFeedStore.
 * Never updates UI. Never calculates gameplay.
 *
 * Features:
 *   - SSE primary subscription
 *   - 5s polling fallback (only if SSE fails)
 *   - Event batching (flush every 120ms)
 *   - Spam reduction (merges repeated same-type events within 3s window)
 *   - Priority auto-assignment based on event type
 */

import { useCallback, useEffect, useRef } from "react";
import { useLiveFeedStore, type FeedEvent, type FeedEventPriority } from "@/stores/useLiveFeedStore";

// ── Priority map ───────────────────────────────────────────────────────────

const EVENT_PRIORITY: Record<string, FeedEventPriority> = {
  steal:           "high",
  revive:          "high",
  elimination:     "high",
  phase:           "critical",
  surge:           "high",
  lead:            "high",
  new_champion:    "critical",
  huge_win:        "critical",
  session_finished:"critical",
  camp_overtaken:  "high",
  effect:          "normal",
  player_joined:   "low",
  squad_created:   "low",
  rank_milestone:  "normal",
  announcement:    "high",
};

function getPriority(type: string): FeedEventPriority {
  return EVENT_PRIORITY[type] ?? "normal";
}

// ── Spam deduplication window ───────────────────────────────────────────────

const DEDUP_WINDOW_MS = 3_000;
const BATCH_FLUSH_MS  = 120;

// ── Hook ───────────────────────────────────────────────────────────────────

export function useLiveFeedUpdates(subSessionId: string | null) {
  const { addEvent, setEvents } = useLiveFeedStore();

  const batchRef      = useRef<FeedEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentTypes   = useRef<Map<string, number>>(new Map());
  const sseRef        = useRef<EventSource | null>(null);
  const pollTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseActiveRef  = useRef(false);

  // ── Spam filter ────────────────────────────────────────────────────────

  const isDuplicate = useCallback((event: FeedEvent): boolean => {
    const key = `${event.type}:${event.actor?.user_id ?? ""}`;
    const last = recentTypes.current.get(key) ?? 0;
    if (Date.now() - last < DEDUP_WINDOW_MS) return true;
    recentTypes.current.set(key, Date.now());
    return false;
  }, []);

  // ── Batch flush ────────────────────────────────────────────────────────

  const flushBatch = useCallback(() => {
    const batch = batchRef.current.splice(0);
    for (const event of batch) {
      addEvent(event);
    }
  }, [addEvent]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      flushBatch();
    }, BATCH_FLUSH_MS);
  }, [flushBatch]);

  // ── Enrich event with priority ─────────────────────────────────────────

  const enrich = useCallback((raw: FeedEvent): FeedEvent => ({
    ...raw,
    priority: raw.priority ?? getPriority(raw.type),
  }), []);

  // ── Ingest an incoming event ───────────────────────────────────────────

  const ingest = useCallback((raw: FeedEvent) => {
    const event = enrich(raw);
    if (isDuplicate(event)) return;
    batchRef.current.push(event);
    scheduleFlush();
  }, [enrich, isDuplicate, scheduleFlush]);

  // ── Initial fetch ──────────────────────────────────────────────────────

  const fetchInitial = useCallback(async () => {
    if (!subSessionId) return;
    try {
      const res = await fetch(`/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=20`);
      if (!res.ok) return;
      const data = await res.json() as { events?: FeedEvent[] };
      if (Array.isArray(data.events)) {
        setEvents(data.events.map(enrich));
      }
    } catch {/* non-critical — feed degrades gracefully */}
  }, [subSessionId, setEvents, enrich]);

  // ── Polling fallback ───────────────────────────────────────────────────

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(async () => {
      if (!subSessionId) return;
      try {
        const res = await fetch(`/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=30`);
        if (!res.ok) return;
        const data = await res.json() as { events?: FeedEvent[] };
        if (Array.isArray(data.events)) {
          setEvents(data.events.map(enrich));
        }
      } catch {/* silent */}
    }, 5_000);
  }, [subSessionId, setEvents, enrich]);

  // ── SSE subscription ───────────────────────────────────────────────────

  useEffect(() => {
    if (!subSessionId) return;

    fetchInitial();

    const es = new EventSource(`/api/realtime/${subSessionId}`);
    sseRef.current = es;

    es.onopen = () => {
      sseActiveRef.current = true;
      // Cancel polling if SSE is healthy
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    es.addEventListener("livefeed:event", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === "livefeed:event" && payload.payload) {
          ingest(payload.payload as FeedEvent);
        } else if (payload?.id && payload?.type) {
          ingest(payload as FeedEvent);
        }
      } catch {/* parse error — skip */}
    });

    // Also listen to the generic message channel (some backends use this)
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === "livefeed:event" && payload.payload) {
          ingest(payload.payload as FeedEvent);
        }
      } catch {/* skip */}
    };

    es.onerror = () => {
      sseActiveRef.current = false;
      startPolling();
    };

    return () => {
      es.close();
      sseRef.current = null;
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [subSessionId, fetchInitial, ingest, startPolling]);
}
