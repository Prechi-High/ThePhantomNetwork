'use client';

import { useEffect, useRef } from 'react';
import { useLeaderboardStore, type LeaderboardEntry, type SquadLeaderboardEntry } from '@/stores/useLeaderboardStore';

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

interface SquadLeaderboardResponse {
  squad_leaderboard: SquadLeaderboardEntry[];
}

/**
 * Polls leaderboard data with WebSocket real-time updates
 * - Initial fetch: GET /api/gameplay/leaderboard
 * - Poll interval: 2 seconds
 * - Real-time: WebSocket leaderboard:updated events
 */
export function useLeaderboardUpdates(subSessionId: string | null) {
  const store = useLeaderboardStore();
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!subSessionId) return;

    // Fetch both individual and squad leaderboards
    const fetchLeaderboards = async () => {
      try {
        const [indResponse, squadResponse] = await Promise.all([
          fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=individual`),
          fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=squad`),
        ]);

        if (!indResponse.ok) throw new Error(`Individual leaderboard: ${indResponse.status}`);
        if (!squadResponse.ok) throw new Error(`Squad leaderboard: ${squadResponse.status}`);

        const indData = (await indResponse.json()) as LeaderboardResponse;
        const squadData = (await squadResponse.json()) as SquadLeaderboardResponse;

        if (Array.isArray(indData.leaderboard)) {
          store.updateIndividual(indData.leaderboard);
        }
        if (Array.isArray(squadData.squad_leaderboard)) {
          store.updateSquad(squadData.squad_leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboards:', error);
      }
    };

    // Initial fetch
    fetchLeaderboards();

    // Real-time subscription
    const subscribeToRealtime = () => {
      try {
        const es = new EventSource(`/api/realtime/${subSessionId}`);

        const handleLeaderboardUpdate = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data);
            if (event.type === 'leaderboard:updated') {
              const { payload } = event;
              if (payload.event === 'rank_changed' && payload.user_id) {
                store.updateRank(payload.user_id, payload.new_rank);
              }
            } else if (event.type === 'squad_leaderboard:rank_changed' && event.payload?.squad_id) {
              store.updateSquadRank(event.payload.squad_id, event.payload.new_rank);
            }
          } catch (error) {
            console.error('Failed to parse leaderboard event:', error);
          }
        };

        es.addEventListener('leaderboard:updated', handleLeaderboardUpdate);
        es.addEventListener('squad_leaderboard:rank_changed', handleLeaderboardUpdate);
        es.onerror = () => {
          console.warn('EventSource error in leaderboard updates');
          es.close();
        };

        return () => {
          es.removeEventListener('leaderboard:updated', handleLeaderboardUpdate);
          es.removeEventListener('squad_leaderboard:rank_changed', handleLeaderboardUpdate);
          es.close();
        };
      } catch (error) {
        console.error('Failed to subscribe to leaderboard realtime:', error);
        return () => {};
      }
    };

    const unsubscribeRealtime = subscribeToRealtime();

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(fetchLeaderboards, 2000);

    // Cleanup
    return () => {
      unsubscribeRealtime();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [subSessionId, store]);
}
