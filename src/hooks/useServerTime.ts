"use client";

/**
 * useServerTime — The Master Clock
 *
 * Domain: Server time synchronization only.
 * Owns: server time offset, latency measurement, drift detection, re-sync.
 * Never owns: gameplay logic, UI state, visual effects.
 *
 * Architecture:
 *   1. Fetch server time on mount
 *   2. Calculate round-trip latency
 *   3. Compute offset = serverTime - clientTime
 *   4. Detect drift on re-sync
 *   5. Expose stable `now()` and `getCountdown()` methods
 *
 * Every player's timer reaches 00:00 at exactly the same moment.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

// ── Types ──────────────────────────────────────────────────────────────────

export type NetworkQuality = "excellent" | "good" | "fair" | "poor" | "offline";

export interface ServerTimeResult {
  /** Server-corrected current time in ms */
  now: () => number;
  /** Milliseconds remaining until an ISO expiry timestamp */
  getCountdown: (expiresAt: string) => number;
  /** Server-client offset in ms (positive = client is ahead) */
  offsetMs: number;
  /** Round-trip latency in ms */
  latencyMs: number;
  /** Network quality tier */
  quality: NetworkQuality;
  /** Whether initial sync has completed */
  isSynced: boolean;
  /** Drift since last sync (ms) */
  driftMs: number;
  /** Manually trigger a re-sync */
  resync: () => Promise<void>;
}

// ── Quality from latency ───────────────────────────────────────────────────

function qualityFromLatency(ms: number): NetworkQuality {
  if (ms < 0) return "offline";
  if (ms < 80)  return "excellent";
  if (ms < 200) return "good";
  if (ms < 500) return "fair";
  return "poor";
}

const RESYNC_INTERVAL_MS = 30_000;

// ── Hook ──────────────────────────────────────────────────────────────────

export function useServerTime(): ServerTimeResult {
  const [offsetMs,  setOffsetMs]  = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [isSynced,  setIsSynced]  = useState(false);
  const [driftMs,   setDriftMs]   = useState(0);
  const prevOffsetRef = useRef(0);
  const syncSession = useSessionStore((s) => s.syncServer);

  const resync = useCallback(async () => {
    try {
      const t0 = Date.now();
      const res = await fetch("/api/server-time");
      if (!res.ok) throw new Error(`server-time ${res.status}`);
      const t1 = Date.now();
      const data = await res.json() as { server_time: string };
      const t2 = Date.now();

      const rtt = t2 - t0;
      const serverMs = new Date(data.server_time).getTime() + rtt / 2;
      const newOffset = Date.now() - serverMs;
      const newDrift = Math.abs(newOffset - prevOffsetRef.current);

      prevOffsetRef.current = newOffset;

      setOffsetMs(newOffset);
      setLatencyMs(rtt);
      setDriftMs(newDrift);
      setIsSynced(true);

      // Notify session store (only tracks offset/sync flag, no re-render loop)
      syncSession(serverMs);

      if (process.env.NODE_ENV === "development") {
        console.log(`[useServerTime] rtt=${rtt}ms offset=${newOffset}ms drift=${newDrift}ms`);
      }
    } catch (err) {
      console.warn("[useServerTime] sync failed:", err);
    }
  }, [syncSession]);

  useEffect(() => {
    resync();
    const id = setInterval(resync, RESYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [resync]);

  return {
    now:         useCallback(() => Date.now() - offsetMs, [offsetMs]),
    getCountdown: useCallback((expiresAt: string) => {
      const expiresMs = new Date(expiresAt).getTime();
      return Math.max(0, expiresMs - (Date.now() - offsetMs));
    }, [offsetMs]),
    offsetMs,
    latencyMs,
    quality: qualityFromLatency(latencyMs),
    isSynced,
    driftMs,
    resync,
  };
}
