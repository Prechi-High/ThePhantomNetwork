'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/stores/useSessionStore';
import { useServerTime } from '@/hooks/useServerTime';

/**
 * Live Game Timer
 * 
 * Displays the remaining time for the current phase.
 * Reads from backend and stays synchronized via server time drift calculation.
 */
export function GameTimer() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const serverTime = useServerTime();
  const [remaining, setRemaining] = useState<number>(0);
  const [key, setKey] = useState<number>(0);

  // Update countdown every 100ms for smooth animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentSession) return;

      // Get phase end time from session
      const phaseEndTime = (currentSession as any).phase_end_time;
      if (!phaseEndTime) return;

      // Calculate remaining ms using server time
      const remainingMs = serverTime.getCountdown(phaseEndTime);
      const remainingClamped = Math.max(0, remainingMs);

      setRemaining(remainingClamped);
      setKey((prev) => prev + 1); // Trigger re-render
    }, 100);

    return () => clearInterval(interval);
  }, [currentSession, serverTime]);

  // Format milliseconds to MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const displayTime = formatTime(remaining);

  // Determine color based on time remaining
  const getTimerColor = () => {
    const secondsRemaining = remaining / 1000;
    if (secondsRemaining <= 10) return '#ef4444'; // Red for < 10s
    if (secondsRemaining <= 30) return '#f59e0b'; // Amber for < 30s
    return '#ffffff'; // White for > 30s
  };

  return (
    <motion.span
      className="text-3xl"
      key={key}
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.05 }}
      style={{
        fontWeight: 900,
        letterSpacing: '0.05em',
        color: getTimerColor(),
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        textShadow: `0 0 16px ${getTimerColor()}40`,
      }}
    >
      {displayTime}
    </motion.span>
  );
}