"use client";
import { Users } from "lucide-react";

interface AliveCounterProps {
  totalPlayers: number;
}

export function AliveCounter({ totalPlayers }: AliveCounterProps) {
  return (
    <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
        <div>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">ALIVE</p>
          <p className="text-base sm:text-xl font-mono font-bold text-white">{totalPlayers || 28}</p>
        </div>
      </div>
    </div>
  );
}
