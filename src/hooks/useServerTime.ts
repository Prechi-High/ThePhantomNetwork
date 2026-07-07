'use client';

import { useEffect, useRef, useState } from 'react';

interface ServerTimeService {
  now: () => number;
  getCountdown: (expiresAt: string | number) => number;
  getDrift: () => number;
}

/**
 * Hook for synchronized server time tracking
 * Calculates and maintains drift offset to keep client time in sync with server
 * 
 * Usage:
 * ```
 * const { now, getCountdown } = useServerTime();
 * const remaining = getCountdown(phaseEndsAtTimestamp);
 * ```
 */
export function useServerTime(): ServerTimeService {
  const driftRef = useRef<number>(0);
  const [syncedAt, setSyncedAt] = useState<number>(Date.now());

  useEffect(() => {
    // Initial sync
    const syncTime = async () => {
      try {
        const response = await fetch('/api/server-time');
        if (!response.ok) return;

        const { server_time } = await response.json();
        const serverMs = new Date(server_time).getTime();
        const clientMs = Date.now();
        driftRef.current = clientMs - serverMs;
        setSyncedAt(clientMs);
      } catch (error) {
        console.warn('Failed to sync server time:', error);
      }
    };

    syncTime();

    // Resync every 60 seconds
    const syncInterval = setInterval(syncTime, 60000);

    return () => clearInterval(syncInterval);
  }, []);

  const now = (): number => {
    return Date.now() - driftRef.current;
  };

  const getCountdown = (expiresAt: string | number): number => {
    let expiresAtMs: number;

    if (typeof expiresAt === 'string') {
      expiresAtMs = new Date(expiresAt).getTime();
    } else {
      expiresAtMs = expiresAt;
    }

    return Math.max(0, expiresAtMs - now());
  };

  const getDrift = (): number => {
    return driftRef.current;
  };

  return { now, getCountdown, getDrift };
}
