'use client';

import React, { useMemo } from 'react';
import { useGameplayStore } from '@/stores/useGameplayStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { useServerTime } from '@/hooks/useServerTime';

interface TopHUDProps {
  currentUserId?: string;
}

export function TopHUD({ currentUserId }: TopHUDProps) {
  const { tokens, phase, phaseEndsAt } = useGameplayStore((s) => ({
    tokens: s.tokens,
    phase: s.phase,
    phaseEndsAt: s.phaseEndsAt,
  }));

  const { individual: leaderboard } = useLeaderboardStore((s) => ({
    individual: s.individual,
  }));

  const { now } = useServerTime();

  // Find current player rank
  const playerRank = useMemo(() => {
    if (!currentUserId || !leaderboard || leaderboard.length === 0) return null;
    const entry = leaderboard.find((e) => e.user_id === currentUserId);
    return entry?.rank ?? null;
  }, [currentUserId, leaderboard]);

  // Calculate remaining time
  const remaining = phaseEndsAt ? Math.max(0, phaseEndsAt - now()) : 0;
  const remainingSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Show loading if critical data missing
  if (tokens === null || phase === null || playerRank === null || leaderboard.length === 0) {
    return (
      <div className="top-hud flex items-center justify-between gap-8 bg-black/80 px-6 py-4 rounded-lg border border-purple-500/30 backdrop-blur animate-pulse">
        <div className="h-12 w-16 bg-gray-700 rounded" />
        <div className="h-12 w-16 bg-gray-700 rounded" />
        <div className="h-12 w-16 bg-gray-700 rounded" />
        <div className="h-12 w-16 bg-gray-700 rounded" />
        <div className="h-12 w-16 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="top-hud flex items-center justify-between gap-8 bg-black/80 px-6 py-4 rounded-lg border border-purple-500/30 backdrop-blur">
      {/* Timer */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Phase Time</span>
        <span
          className="text-4xl font-black text-cyan-400"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatTime}
        </span>
      </div>

      {/* Phase indicator */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Phase</span>
        <span className="text-3xl font-black text-purple-400">{phase}</span>
      </div>

      {/* Tokens - LIVE from backend */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Your Tokens</span>
        <span className="text-3xl font-black text-yellow-400">{tokens.toFixed(1)}</span>
      </div>

      {/* Rank - LIVE from leaderboard */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Your Rank</span>
        <span className="text-3xl font-black text-emerald-400">#{playerRank}</span>
      </div>

      {/* Total players - from leaderboard length */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Players</span>
        <span className="text-3xl font-black text-orange-400">{leaderboard.length}</span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-green-500 font-bold">LIVE</span>
      </div>
    </div>
  );
}
