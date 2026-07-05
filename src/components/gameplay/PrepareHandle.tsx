"use client";
import { Briefcase } from "lucide-react";

interface PrepareHandleProps {
  showPrepare: boolean;
  setShowPrepare: (v: boolean) => void;
}

export function PrepareHandle({
  showPrepare,
  setShowPrepare,
}: PrepareHandleProps) {
  return (
    <button
      onClick={() => setShowPrepare(!showPrepare)}
      className="w-full"
    >
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-500/40 rounded-full p-3 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-200 hover:scale-105">
        <Briefcase className="text-yellow-500 w-5 h-5" />
        <span className="text-[7px] font-semibold text-yellow-400">PREPARE</span>
      </div>
      {showPrepare && (
        <div className="absolute top-24 right-3 bg-[#0a0a0f] border border-yellow-500/30 rounded-lg p-3 glass shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          <p className="text-[8px] text-yellow-400">Inventory</p>
          <p className="text-[7px] text-phantom-muted">Shop</p>
          <p className="text-[7px] text-phantom-muted">Recommendations</p>
        </div>
      )}
    </button>
  );
}
