"use client";

import { cn } from "@/lib/utils";

interface InfluenceBarProps {
  current: number;
  nextThreshold: number;
  label?: string;
  className?: string;
}

export function InfluenceBar({ current, nextThreshold, label = "Legacy Influence", className }: InfluenceBarProps) {
  const pct = nextThreshold > 0 ? Math.min(100, (current / nextThreshold) * 100) : 0;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs uppercase tracking-wide text-legacy-muted">
        <span>{label}</span>
        <span className="text-legacy-gold">{current.toLocaleString()} / {nextThreshold.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-legacy-divider">
        <div
          className="h-full rounded-full bg-gradient-to-r from-legacy-gold-dim to-legacy-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
