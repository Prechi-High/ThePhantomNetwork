"use client";

import { useEffect, useMemo, useState } from "react";

/** Isolated surge percent — avoids rebuilding the full play page tree every second. */
export function useSurgePercent(
  phaseEndsAt: number | null | undefined,
  phaseStartedAt: number | null | undefined
): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!phaseEndsAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  return useMemo(() => {
    if (!phaseEndsAt || !phaseStartedAt) return 0;
    const total = phaseEndsAt - phaseStartedAt;
    if (total <= 0) return 0;
    const elapsed = Date.now() - phaseStartedAt;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }, [phaseEndsAt, phaseStartedAt, tick]);
}
