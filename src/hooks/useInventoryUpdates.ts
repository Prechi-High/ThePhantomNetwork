'use client';

import { useEffect } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useServerTime } from '@/hooks/useServerTime';

/**
 * Hook to subscribe to player inventory (skills) and keep them synchronized
 * Fetches skills, syncs server time, and tracks cooldowns
 */
export function useInventoryUpdates(userId: string | null, subSessionId: string | null): void {
  const { setSkills, setServerTime } = useInventoryStore();
  const { now } = useServerTime();

  useEffect(() => {
    if (!userId || !subSessionId) return;

    const fetchInventory = async () => {
      try {
        const response = await fetch(
          `/api/player/inventory?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!response.ok) return;

        const { skills, server_time } = await response.json();
        setSkills(skills);
        setServerTime(new Date(server_time).getTime());
      } catch (error) {
        console.warn('Failed to fetch inventory:', error);
      }
    };

    // Initial fetch
    fetchInventory();

    // Poll every 3 seconds
    const pollInterval = setInterval(fetchInventory, 3000);

    return () => clearInterval(pollInterval);
  }, [userId, subSessionId, setSkills, setServerTime, now]);
}
