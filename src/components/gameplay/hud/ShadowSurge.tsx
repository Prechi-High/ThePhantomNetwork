"use client";

import { motion } from "framer-motion";

interface ShadowSurgeProps {
  percent: number;
  playerRank?: number;
}

export function ShadowSurge({ percent, playerRank = 7 }: ShadowSurgeProps) {
  const rankSuffix = playerRank === 1 ? "st" : playerRank === 2 ? "nd" : playerRank === 3 ? "rd" : "th";

  return (
    <div style={{ paddingInline: "clamp(6px, 1vw, 10px)" }}>
      {/* Label + Rank */}
      <div className="surge-section">
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)" }}>
          <svg width="clamp(9px, 1vw, 11px)" height="clamp(9px, 1vw, 11px)" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
          </svg>
          <span
            className="text-sm"
            style={{
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#c084fc",
              textTransform: "uppercase",
              textShadow: "0 0 7px rgba(192,132,252,0.55)",
            }}
          >
            NEXT: SHADOW SURGE
          </span>
        </div>
        <span
          className="text-sm"
          style={{
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(192,132,252,0.7)",
            textTransform: "uppercase",
          }}
        >
          MY RANK #{playerRank}{rankSuffix}
        </span>
      </div>

      {/* Bar + Percent */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(5px, 0.7vw, 8px)" }}>
        <div className="surge-bar" style={{ flex: 1 }}>
          {/* Segment ticks */}
          {[25, 50, 75].map((p) => (
            <div
              key={p}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${p}%`,
                width: "1px",
                background: "rgba(0,0,0,0.35)",
                zIndex: 10,
              }}
            />
          ))}

          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg,#581c87,#7c3aed,#a855f7,#c084fc)",
              boxShadow: "0 0 10px rgba(168,85,247,0.85), 0 0 3px rgba(192,132,252,0.5)",
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.28) 50%,transparent 100%)",
              }}
            />
          </motion.div>
        </div>

        <span
          className="text-md"
          style={{
            fontWeight: 800,
            color: "#c084fc",
            letterSpacing: "0.04em",
            minWidth: "clamp(26px, 3vw, 32px)",
            textAlign: "right",
            textShadow: "0 0 7px rgba(192,132,252,0.5)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
