'use client';

import { useEffect, useRef } from 'react';
import { useLiveFeedStore, type FeedEvent } from '@/stores/useLiveFeedStore';

/**
 * Subscribes to real-time live feed events with polling fallback
 * - Initial fetch: GET /api/gameplay/livefeed?subSessionId={id}&limit=20
 * - Real-time: WebSocket subscription to livefeed:event
 * - Polling fallback: Every 2 seconds
 */
export function useLiveFeedUpdates(subSessionId: string | null) {
  const { addEvent, setEvents } = useLiveFeedStore();
  const pollIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!subSessionId) return;

    // Initial fetch
    const fetchInitialEvents = async () => {
      try {
        const response = await fetch(
          `/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=20`
        );
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Failed to fetch initial live feed events:', error);
      }
    };

    fetchInitialEvents();

    // WebSocket real-time subscription
    const subscribeToRealtime = () => {
      try {
        const es = new EventSource(
          `/api/realtime/${subSessionId}`
        );

        const handleMessage = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'livefeed:event' && event.payload) {
              addEvent(event.payload as FeedEvent);
            }
          } catch (error) {
            console.error('Failed to parse livefeed event:', error);
          }
        };

        es.addEventListener('livefeed:event', handleMessage);
        es.onerror = () => {
          console.warn('EventSource error, falling back to polling');
          es.close();
        };

        return () => {
          es.removeEventListener('livefeed:event', handleMessage);
          es.close();
        };
      } catch (error) {
        console.error('Failed to subscribe to realtime events:', error);
        return () => {};
      }
    };

    const unsubscribeRealtime = subscribeToRealtime();

    // Polling fallback (every 2 seconds)
    const pollEvents = async () => {
      try {
        const response = await fetch(
          `/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=50`
        );
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Live feed polling error:', error);
      }
    };

    pollIntervalRef.current = setInterval(pollEvents, 2000);

    // Cleanup
    return () => {
      unsubscribeRealtime();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [subSessionId, addEvent, setEvents]);
}
