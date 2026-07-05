"use client";

export function BottomHideHandle() {
  return (
    <div className="hidden sm:flex flex-col items-center gap-1">
      <div className="flex gap-1">
        <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
        <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
        <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
      </div>
      <p className="text-[7px] text-phantom-muted/60 uppercase">Bottom navigation hidden</p>
    </div>
  );
}
