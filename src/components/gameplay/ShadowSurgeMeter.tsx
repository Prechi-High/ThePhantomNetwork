"use client";

export function ShadowSurgeMeter() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative w-20 sm:w-28 h-1 bg-phantom-border/50 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: "72%" }} />
      </div>
      <div className="flex flex-col">
        <span className="text-[7px] sm:text-[9px] text-purple-400 font-semibold uppercase">Shadow Surge</span>
        <span className="text-[6px] sm:text-[8px] text-phantom-muted">72%</span>
      </div>
    </div>
  );
}
