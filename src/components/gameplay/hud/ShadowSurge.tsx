"use client";

import { motion } from "framer-motion";

interface ShadowSurgeProps {
  percent: number;
  playerRank?: number;
}

export function ShadowSurge({ percent, playerRank = 7 }: ShadowSurgeProps) {
  const rankSuffix = playerRank === 1 ? "st" : playerRank === 2 ? "nd" : playerRank === 3 ? "rd" : "th";

  return (
    <div className="px-[8px] py-[3px]">
      {/* Row: label left  |  rank right */}
      <div className="flex items-center justify-between mb-[3px]">
        <div className="flex items-center gap-[4px]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
          </svg>
          <span style={{ fontSize: "8.5px", fontWeight: 800, letterSpacing: "0.16em", color: "#c084fc", textTransform: "uppercase", textShadow: "0 0 7px rgba(192,132,252,0.55)" }}>
            NEXT: SHADOW SURGE
          </span>
        </div>
        <span style={{ fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(192,132,252,0.7)", textTransform: "uppercase" }}>
          MY RANK #{playerRank}{rankSuffix}
        </span>
      </div>

      {/* Bar + percent */}
      <div className="flex items-center gap-[6px]">
        <div
          className="flex-1 rounded-full overflow-hidden relative"
          style={{ height: "8px", background: "rgba(49,7,70,0.45)", border: "1px solid rgba(168,85,247,0.22)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {/* Segment ticks */}
          {[25, 50, 75].map((p) => (
            <div key={p} className="absolute top-0 bottom-0 z-10" style={{ left: `${p}%`, width: "1px", background: "rgba(0,0,0,0.35)" }} />
          ))}

          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg,#581c87,#7c3aed,#a855f7,#c084fc)", boxShadow: "0 0 10px rgba(168,85,247,0.85), 0 0 3px rgba(192,132,252,0.5)" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.28) 50%,transparent 100%)" }}
            />
          </motion.div>
        </div>

        <span style={{ fontSize: "10px", fontWeight: 800, color: "#c084fc", letterSpacing: "0.04em", minWidth: "28px", textAlign: "right", textShadow: "0 0 7px rgba(192,132,252,0.5)", fontVariantNumeric: "tabular-nums" }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}
