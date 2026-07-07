'use client';

import { useEffect, useRef } from 'react';
import { useInventoryStore, type SkillInInventory } from '@/stores/useInventoryStore';

interface InventoryResponse {
  skills: SkillInInventory[];
  server_time: string;
}

/**
 * Tracks player skill inventory and cooldowns
 * - Initial fetch: GET /api/player/inventory
 * - Poll interval: 3 seconds
 * - Real-time: WebSocket skill:available and skill:charged
 */
export function useInventoryUpdates(userId: string | null, subSessionId: string | null) {
  const store = useInventoryStore();
  const pollIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!userId || !subSessionId) return;

    // Fetch player inventory
    const fetchInventory = async () => {
      try {
        const response = await fetch(
          `/api/player/inventory?userId=${userId}&subSessionId=${subSessionId}`
        );
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = (await response.json()) as InventoryResponse;
        if (Array.isArray(data.skills)) {
          store.setSkills(data.skills);
        }
        if (data.server_time) {
          store.setServerTime(data.server_time);
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    // Initial fetch
    fetchInventory();

    // Real-time subscriptions
    const subscribeToRealtime = () => {
      try {
        const es = new EventSource(`/api/realtime/${subSessionId}`);

        const handleSkillAvailable = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'skill:available' && event.payload?.skillId) {
              store.updateSkillCooldown(event.payload.skillId, 0);
            }
          } catch (error) {
            console.error('Failed to parse skill:available event:', error);
          }
        };

        const handleSkillCharged = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'skill:charged' && event.payload?.skillId) {
              store.updateSkillCharges(event.payload.skillId, event.payload.charges);
            }
          } catch (error) {
            console.error('Failed to parse skill:charged event:', error);
          }
        };

        es.addEventListener('skill:available', handleSkillAvailable);
        es.addEventListener('skill:charged', handleSkillCharged);
        es.onerror = () => {
          console.warn('EventSource error in inventory updates');
          es.close();
        };

        return () => {
          es.removeEventListener('skill:available', handleSkillAvailable);
          es.removeEventListener('skill:charged', handleSkillCharged);
          es.close();
        };
      } catch (error) {
        console.error('Failed to subscribe to inventory realtime:', error);
        return () => {};
      }
    };

    const unsubscribeRealtime = subscribeToRealtime();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(fetchInventory, 3000);

    // Cleanup
    return () => {
      unsubscribeRealtime();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userId, subSessionId, store]);
}
