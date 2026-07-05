"use client";

interface RankCardProps {
  playerRank: number;
}

export function RankCard({ playerRank }: RankCardProps) {
  return (
    <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2 text-right">
      <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">MY RANK</p>
      <p className="text-base sm:text-xl font-mono font-bold text-purple-400">#{playerRank || 7}</p>
    </div>
  );
}
