'use client';

import { useEffect } from 'react';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';

/**
 * Hook to subscribe to leaderboard updates from backend
 * Polls individual and squad leaderboards every 2 seconds
 */
export function useLeaderboardUpdates(subSessionId: string | null): void {
  const { updateIndividual, updateSquad, updateRank, updateSquadRank } = useLeaderboardStore();

  useEffect(() => {
    if (!subSessionId) return;

    const fetchLeaderboards = async () => {
      try {
        // Fetch both leaderboards in parallel
        const [individualRes, squadRes] = await Promise.all([
          fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=individual`),
          fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=squad`),
        ]);

        if (individualRes.ok) {
          const { leaderboard } = await individualRes.json();
          updateIndividual(leaderboard);
        }

        if (squadRes.ok) {
          const { leaderboard } = await squadRes.json();
          updateSquad(leaderboard);
        }
      } catch (error) {
        console.warn('Failed to fetch leaderboard:', error);
      }
    };

    // Initial fetch
    fetchLeaderboards();

    // Poll every 2 seconds
    const pollInterval = setInterval(fetchLeaderboards, 2000);

    return () => clearInterval(pollInterval);
  }, [subSessionId, updateIndividual, updateSquad]);
}
