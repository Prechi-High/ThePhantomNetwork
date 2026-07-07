'use client';

import { useEffect, useState } from 'react';

interface ServerTimeResult {
  now: () => number;
  getCountdown: (expiresAt: string) => number;
}

/**
 * Provides synchronized server time for accurate countdowns
 * - Fetches server time on mount
 * - Calculates drift between client and server
 * - Re-syncs every 60 seconds to handle clock skew
 */
export function useServerTime(): ServerTimeResult {
  const [drift, setDrift] = useState(0);

  useEffect(() => {
    // Initial sync on mount
    const syncTime = async () => {
      try {
        const response = await fetch('/api/server-time');
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = (await response.json()) as { server_time: string };

        const serverTimeMs = new Date(data.server_time).getTime();
        const clientTimeMs = Date.now();
        const calculatedDrift = clientTimeMs - serverTimeMs;

        setDrift(calculatedDrift);
      } catch (error) {
        console.error('Failed to sync server time:', error);
      }
    };

    syncTime();

    // Re-sync every 60 seconds
    const syncInterval = setInterval(syncTime, 60000);

    return () => clearInterval(syncInterval);
  }, []);

  return {
    now: () => Date.now() - drift,
    getCountdown: (expiresAt: string) => {
      const expiresAtMs = new Date(expiresAt).getTime();
      const currentTimeMs = Date.now() - drift;
      return Math.max(0, expiresAtMs - currentTimeMs);
    },
  };
}
