"use client";

import { motion } from "framer-motion";

export function VoiceWidgetHUD() {
  return (
    <div
      className="flex items-center gap-[8px] rounded-[11px] px-[9px] py-[6px]"
      style={{
        background: "rgba(4,14,8,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(34,197,94,0.28)",
        boxShadow: "0 0 10px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.08)",
        flex: 1,
      }}
    >
      {/* Mic icon */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: "28px", height: "28px" }}>
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          style={{ width: "26px", height: "26px", border: "1px solid rgba(34,197,94,0.45)", borderRadius: "50%" }}
        />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
          <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right: labels + bars */}
      <div className="flex flex-col gap-[3px] min-w-0">
        <div className="flex items-center gap-[4px]">
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            VOICE ROOM
          </span>
          {/* badge */}
          <div className="rounded-full flex items-center justify-center" style={{ width: "13px", height: "13px", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.7)", flexShrink: 0 }}>
            <span style={{ fontSize: "7px", fontWeight: 900, color: "#000", lineHeight: 1 }}>6</span>
          </div>
        </div>

        {/* Wave bars */}
        <div className="flex items-end gap-[1.5px]" style={{ height: "11px" }}>
          {[3, 7, 11, 8, 5, 9, 6, 4, 7].map((h, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{ height: [`${h}px`, `${h + 4}px`, `${h}px`] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.065, ease: "easeInOut" }}
              style={{ width: "2px", background: i < 4 ? "#22c55e" : "rgba(34,197,94,0.35)" }}
            />
          ))}
        </div>

        <span style={{ fontSize: "8px", fontWeight: 600, color: "rgba(34,197,94,0.55)", lineHeight: 1 }}>
          8 / 20
        </span>
      </div>
    </div>
  );
}
