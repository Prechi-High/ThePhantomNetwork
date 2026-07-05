"use client";

export function RecordingIndicator() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 glass rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-red-900/50 bg-red-900/10">
      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[8px] sm:text-[10px] text-red-400 font-semibold uppercase">REC</span>
    </div>
  );
}
