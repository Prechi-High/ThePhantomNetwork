"use client";

interface PrizePoolCardProps {
  totalPoolCents?: number | null;
}

export function PrizePoolCard({ totalPoolCents }: PrizePoolCardProps) {
  return (
    <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-lg sm:text-xl">$</span>
        <div>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">PRIZE POOL</p>
          <p className="text-base sm:text-xl font-mono font-bold text-white">
            {totalPoolCents != null ? `$${(totalPoolCents / 100).toLocaleString()}` : "$0"}
          </p>
        </div>
      </div>
    </div>
  );
}
