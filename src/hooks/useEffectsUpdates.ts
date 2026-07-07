'use client';

import { useEffect, useRef } from 'react';
import { useEffectsStore } from '@/stores/useEffectsStore';
import { useServerTime } from '@/hooks/useServerTime';

/**
 * Hook to subscribe to active effects and keep them synchronized
 * Fetches effects, syncs server time, and auto-removes expired effects
 */
export function useEffectsUpdates(userId: string | null, subSessionId: string | null): void {
  const { setEffects, setServerTime, removeEffect } = useEffectsStore();
  const { now } = useServerTime();
  const cleanupTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId || !subSessionId) return;

    const fetchEffects = async () => {
      try {
        const response = await fetch(
          `/api/player/effects?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!response.ok) return;

        const { effects, server_time } = await response.json();
        setEffects(effects);
        setServerTime(new Date(server_time).getTime());
      } catch (error) {
        console.warn('Failed to fetch effects:', error);
      }
    };

    // Initial fetch
    fetchEffects();

    // Cleanup expired effects every 1 second
    cleanupTimerRef.current = setInterval(() => {
      const effects = useEffectsStore.getState().effects;
      effects.forEach((effect) => {
        if (now() > new Date(effect.expires_at).getTime()) {
          removeEffect(effect.id);
        }
      });
    }, 1000);

    // Resync with server every 30 seconds
    const resyncInterval = setInterval(fetchEffects, 30000);

    return () => {
      clearInterval(cleanupTimerRef.current);
      clearInterval(resyncInterval);
    };
  }, [userId, subSessionId, setEffects, setServerTime, removeEffect, now]);
}
