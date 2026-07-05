"use client";

interface PhaseIndicatorProps {
  phase: number;
}

export function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  return (
    <p className="text-xs sm:text-sm font-bold text-purple-500">PHASE {phase}/{6}</p>
  );
}
