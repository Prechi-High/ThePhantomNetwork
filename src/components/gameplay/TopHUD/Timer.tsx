"use client";

interface TimerProps {
  phaseEndsAt: number | null;
  remaining: number;
}

function formatPhaseTimer(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Timer({ phaseEndsAt, remaining }: TimerProps) {
  return (
    <p className="text-xl sm:text-2xl font-mono font-bold text-white">
      {phaseEndsAt != null ? formatPhaseTimer(remaining) : "02:45"}
    </p>
  );
}
