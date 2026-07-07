'use client';

import { useEffect, useRef } from 'react';
import { useEffectsStore, type ActiveEffect } from '@/stores/useEffectsStore';

interface EffectsResponse {
  effects: ActiveEffect[];
  server_time: string;
}

/**
 * Manages active effects with real-time synchronization
 * - Initial fetch: GET /api/player/effects
 * - Real-time: WebSocket effect:activated and effect:expired
 * - Server time sync: Every 30 seconds
 * - Cleanup: Every 1 second, removes expired effects
 */
export function useEffectsUpdates(userId: string | null, subSessionId: string | null) {
  const store = useEffectsStore();
  const syncTimerRef = useRef<NodeJS.Timeout>();
  const cleanupTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId || !subSessionId) return;

    // Initial fetch
    const fetchEffects = async () => {
      try {
        const response = await fetch(
          `/api/player/effects?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = (await response.json()) as EffectsResponse;
        if (Array.isArray(data.effects)) {
          store.setEffects(data.effects);
        }
      } catch (error) {
        console.error('Failed to fetch initial effects:', error);
      }
    };

    fetchEffects();

    // Real-time subscriptions
    const subscribeToRealtime = () => {
      try {
        const es = new EventSource(`/api/realtime/${subSessionId}`);

        const handleEffectActivated = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'effect:activated' && event.payload) {
              store.addEffect(event.payload as ActiveEffect);
            }
          } catch (error) {
            console.error('Failed to parse effect:activated event:', error);
          }
        };

        const handleEffectExpired = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'effect:expired' && event.payload?.effectId) {
              store.removeEffect(event.payload.effectId);
            }
          } catch (error) {
            console.error('Failed to parse effect:expired event:', error);
          }
        };

        es.addEventListener('effect:activated', handleEffectActivated);
        es.addEventListener('effect:expired', handleEffectExpired);
        es.onerror = () => {
          console.warn('EventSource error in effects updates');
          es.close();
        };

        return () => {
          es.removeEventListener('effect:activated', handleEffectActivated);
          es.removeEventListener('effect:expired', handleEffectExpired);
          es.close();
        };
      } catch (error) {
        console.error('Failed to subscribe to effects realtime:', error);
        return () => {};
      }
    };

    const unsubscribeRealtime = subscribeToRealtime();

    // Sync server time every 30 seconds
    const syncServerTime = async () => {
      try {
        const response = await fetch('/api/server-time');
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = (await response.json()) as { server_time: string };
        // Server time is used by caller via store if needed
      } catch (error) {
        console.error('Failed to sync server time:', error);
      }
    };

    syncTimerRef.current = setInterval(syncServerTime, 30000);

    // Clean up expired effects every 1 second
    const cleanupExpired = () => {
      const expiredIds = store.effects
        .filter((e) => store.isExpired(e.id))
        .map((e) => e.id);

      expiredIds.forEach((id) => store.removeEffect(id));
    };

    cleanupTimerRef.current = setInterval(cleanupExpired, 1000);

    // Cleanup
    return () => {
      unsubscribeRealtime();
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current);
    };
  }, [userId, subSessionId, store]);
}
