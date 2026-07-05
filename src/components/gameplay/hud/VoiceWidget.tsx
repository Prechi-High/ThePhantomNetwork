"use client";

import { motion } from "framer-motion";

export function VoiceWidgetHUD() {
  return (
    <div
      className="flex flex-col items-start gap-[5px] rounded-[14px] px-[10px] py-[9px]"
      style={{
        background: "linear-gradient(135deg,rgba(6,20,10,0.92) 0%,rgba(10,30,16,0.88) 100%)",
        border: "1px solid rgba(34,197,94,0.35)",
        boxShadow:
          "0 0 14px rgba(34,197,94,0.15), inset 0 1px 0 rgba(34,197,94,0.1)",
        minWidth: "90px",
      }}
    >
      {/* Mic icon with pulsing ring */}
      <div className="relative flex items-center justify-center mb-[3px]">
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1.5px solid rgba(34,197,94,0.5)",
          }}
        />
        {/* Mic SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
          <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Voice bars */}
      <div className="flex items-end gap-[2px]" style={{ height: "14px" }}>
        {[3, 6, 10, 7, 4, 8, 5, 3, 6].map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{ height: [`${h}px`, `${h + 4}px`, `${h}px`] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.07,
              ease: "easeInOut",
            }}
            style={{
              width: "2.5px",
              background: i < 3 ? "#22c55e" : "rgba(34,197,94,0.4)",
            }}
          />
        ))}
      </div>

      {/* Label row */}
      <div className="flex items-center gap-[4px]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
          <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          VOICE ROOM
        </span>
        {/* Badge */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: "14px",
            height: "14px",
            background: "#22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.7)",
          }}
        >
          <span style={{ fontSize: "8px", fontWeight: 900, color: "#000", lineHeight: 1 }}>6</span>
        </div>
      </div>

      <span
        style={{
          fontSize: "9px",
          fontWeight: 600,
          color: "rgba(34,197,94,0.6)",
          lineHeight: 1,
        }}
      >
        8 / 20
      </span>
    </div>
  );
}
