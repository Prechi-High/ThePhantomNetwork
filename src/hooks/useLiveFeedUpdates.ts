'use client';

import { useEffect } from 'react';
import { useLiveFeedStore } from '@/stores/useLiveFeedStore';

/**
 * Hook to subscribe to live feed events from backend
 * Fetches initial events and subscribes to real-time updates
 */
export function useLiveFeedUpdates(subSessionId: string | null): void {
  const { setEvents, addEvent } = useLiveFeedStore();

  useEffect(() => {
    if (!subSessionId) return;

    // Initial fetch
    const fetchFeed = async () => {
      try {
        const response = await fetch(`/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=20`);
        if (!response.ok) return;

        const { events } = await response.json();
        setEvents(events);
      } catch (error) {
        console.warn('Failed to fetch live feed:', error);
      }
    };

    fetchFeed();

    // Polling fallback every 2 seconds
    const pollInterval = setInterval(fetchFeed, 2000);

    return () => clearInterval(pollInterval);
  }, [subSessionId, setEvents, addEvent]);
}
