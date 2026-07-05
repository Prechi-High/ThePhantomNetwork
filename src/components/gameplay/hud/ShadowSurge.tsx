"use client";

import { motion } from "framer-motion";

interface ShadowSurgeProps {
  percent: number; // 0-100
}

export function ShadowSurge({ percent }: ShadowSurgeProps) {
  return (
    <div className="px-[10px] py-[4px]">
      {/* Label row */}
      <div className="flex items-center gap-[5px] mb-[4px]">
        {/* Lightning bolt */}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"
            fill="#a855f7"
            stroke="#c084fc"
            strokeWidth="1"
          />
        </svg>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "#c084fc",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(192,132,252,0.6)",
          }}
        >
          NEXT: SHADOW SURGE
        </span>
      </div>

      {/* Bar */}
      <div className="relative flex items-center gap-[8px]">
        <div
          className="flex-1 rounded-full overflow-hidden relative"
          style={{
            height: "10px",
            background: "rgba(49,7,70,0.5)",
            border: "1px solid rgba(168,85,247,0.3)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {/* Segment lines */}
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 z-10"
              style={{
                left: `${pct}%`,
                width: "1px",
                background: "rgba(0,0,0,0.4)",
              }}
            />
          ))}

          {/* Fill */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg,#581c87,#7c3aed,#a855f7,#c084fc)",
              boxShadow: "0 0 12px rgba(168,85,247,0.9), 0 0 4px rgba(192,132,252,0.6)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)",
              }}
            />
          </motion.div>
        </div>

        {/* Percent label */}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#c084fc",
            letterSpacing: "0.04em",
            minWidth: "32px",
            textAlign: "right",
            textShadow: "0 0 8px rgba(192,132,252,0.5)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
