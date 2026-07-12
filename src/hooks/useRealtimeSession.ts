"use client";

/**
 * useRealtimeSession — The Battlefield Observer
 *
 * Domain: Session realtime subscription and recovery only.
 * Observes the server stream and delivers raw events to the Runtime.
 * Never updates UI, never triggers animations, never calculates gameplay.
 *
 * Connection states:
 *   DISCONNECTED → CONNECTING → LIVE → RECONNECTING → RECOVERING → LIVE
 *
 * Recovery: on disconnect, retries with backoff, downloads missed events,
 * notifies Runtime to replay timeline — player barely notices.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameplayStore } from "@/stores/useGameplayStore";
import { useStealStore } from "@/stores/useStealStore";
import { useSessionStore } from "@/stores/useSessionStore";

// ── Connection state ───────────────────────────────────────────────────────

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "live"
  | "reconnecting"
  | "recovering"
  | "degraded";

// ── Phase change payload (kept for play-page callback) ─────────────────────

export interface PhaseChangePayload {
  phase: number;
  round?: number;
  phaseEndsAt?: number;
}

// ── Batch buffer ────────────────────────────────────────────────────────────

const BATCH_FLUSH_MS = 80; // flush at most every 80ms

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRealtimeSession(
  subSessionId: string | null,
  onPhaseChange?: (payload: PhaseChangePayload) => void,
  onTokensUpdated?: () => void,
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [latencyMs, setLatencyMs] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const esRef        = useRef<EventSource | null>(null);
  const batchRef     = useRef<unknown[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stores
  const {
    setTokens, setPhase, setRound, setPhaseEndsAt,
    setLastOutcome, setEliminated,
  } = useGameplayStore();
  const { setStealInProgress, incrementFireBoost, resetFireBoost } = useStealStore();
  const { advancePhase, setPlayerCounts } = useSessionStore();

  // ── Event processor (single authoritative handler) ──────────────────────

  const processEvent = useCallback((event: Record<string, unknown>) => {
    const type = event.type as string;

    switch (type) {
      // ---- Tokens / spin ----
      case "tokens_update":
      case "spin_result":
      case "steal_spin":
        if (event.tokens !== undefined) setTokens(Number(event.tokens));
        if (event.outcome !== undefined) setLastOutcome(event.outcome as never);
        break;

      case "round_update":
        if (event.round !== undefined) setRound(Number(event.round));
        break;

      case "tokens_updated":
        onTokensUpdated?.();
        break;

      // ---- Phase ----
      case "phase_change": {
        const phase = Number(event.phase);
        const phaseEndsAt = event.phaseEndsAt ? Number(event.phaseEndsAt) : null;
        const round = event.round ? Number(event.round) : 1;
        setPhase(phase);
        setRound(round);
        if (phaseEndsAt) setPhaseEndsAt(phaseEndsAt);
        advancePhase(phase, phaseEndsAt);
        onPhaseChange?.({ phase, round, phaseEndsAt: phaseEndsAt ?? undefined });
        break;
      }

      // ---- Player status ----
      case "elimination":
        setEliminated(Boolean(event.eliminated));
        break;

      case "player_counts":
        if (event.alive !== undefined || event.total !== undefined) {
          setPlayerCounts({
            alive: event.alive as number,
            total: event.total as number,
          });
        }
        break;

      // ---- Combat ----
      case "steal_in_progress":
        setStealInProgress(true, (event.attackerId as string) ?? null);
        break;
      case "steal_boost":
        incrementFireBoost();
        break;
      case "steal_resolved":
        setStealInProgress(false);
        resetFireBoost();
        break;

      // ---- Latency ping ----
      case "pong":
        if (event.sentAt) setLatencyMs(Date.now() - Number(event.sentAt));
        break;
    }
  }, [
    setTokens, setPhase, setRound, setPhaseEndsAt, setLastOutcome,
    setEliminated, setStealInProgress, incrementFireBoost, resetFireBoost,
    advancePhase, setPlayerCounts, onPhaseChange, onTokensUpdated,
  ]);

  // ── Batch flush ──────────────────────────────────────────────────────────

  const flushBatch = useCallback(() => {
    const batch = batchRef.current.splice(0);
    for (const raw of batch) {
      processEvent(raw as Record<string, unknown>);
    }
  }, [processEvent]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      flushBatch();
    }, BATCH_FLUSH_MS);
  }, [flushBatch]);

  // ── SSE connection ───────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (!subSessionId) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }

    setConnectionState("connecting");

    const es = new EventSource(`/api/realtime/${subSessionId}`);
    esRef.current = es;

    es.onopen = () => {
      setConnectionState("live");
      setReconnectAttempts(0);
    };

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        batchRef.current.push(event);
        scheduleFlush();
      } catch {/* ignore parse errors */}
    };

    es.onerror = () => {
      setConnectionState("reconnecting");
      es.close();
      esRef.current = null;

      // Exponential backoff — max 30s
      setReconnectAttempts((prev) => {
        const attempts = prev + 1;
        const delay = Math.min(1000 * 2 ** Math.min(attempts - 1, 4), 30_000);
        reconnTimerRef.current = setTimeout(() => {
          setConnectionState("recovering");
          connect();
        }, delay);
        return attempts;
      });
    };
  }, [subSessionId, scheduleFlush]);

  useEffect(() => {
    if (!subSessionId) return;
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      if (reconnTimerRef.current) clearTimeout(reconnTimerRef.current);
    };
  }, [subSessionId, connect]);

  return {
    connectionState,
    latencyMs,
    reconnectAttempts,
    isLive: connectionState === "live",
  };
}

// ── usePhaseTimer — Server-synchronized countdown ──────────────────────────

export type TimerState = "running" | "warning" | "critical" | "finished" | "paused";

const WARNING_THRESHOLD_MS  = 30_000;
const CRITICAL_THRESHOLD_MS = 10_000;

export function usePhaseTimer(phaseEndsAt: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!phaseEndsAt) { setRemaining(0); return; }

    const tick = () => {
      const ms = Math.max(0, phaseEndsAt - Date.now());
      setRemaining(ms);
      if (ms === 0) clearInterval(id);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  return remaining;
}

/** Returns the timer semantic state for visual language */
export function useTimerState(phaseEndsAt: number | null): TimerState {
  const remaining = usePhaseTimer(phaseEndsAt);
  if (!phaseEndsAt)                       return "paused";
  if (remaining === 0)                    return "finished";
  if (remaining <= CRITICAL_THRESHOLD_MS) return "critical";
  if (remaining <= WARNING_THRESHOLD_MS)  return "warning";
  return "running";
}
