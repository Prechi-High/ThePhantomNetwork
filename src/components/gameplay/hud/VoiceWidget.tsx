"use client";

import { motion } from "framer-motion";

export function VoiceWidgetHUD() {
  return (
    <div className="control-widget glass-panel" style={{ background: "rgba(4,14,8,0.55)", border: "1px solid rgba(34,197,94,0.28)", boxShadow: "0 0 10px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.08)" }}>
      {/* Mic icon */}
      <div style={{ position: "relative", width: "clamp(24px,3vw,30px)", height: "clamp(24px,3vw,30px)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          style={{ position: "absolute", width: "clamp(22px,2.8vw,28px)", height: "clamp(22px,2.8vw,28px)", border: "1px solid rgba(34,197,94,0.45)", borderRadius: "50%" }}
        />
        <svg width="clamp(13px,1.6vw,16px)" height="clamp(13px,1.6vw,16px)" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
          <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right: labels + bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px,0.3vw,4px)", minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <span className="text-sm" style={{ fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            VOICE ROOM
          </span>
          {/* badge */}
          <div style={{ borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(11px,1.4vw,14px)", height: "clamp(11px,1.4vw,14px)", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.7)", flexShrink: 0 }}>
            <span className="text-xs" style={{ fontWeight: 900, color: "#000", lineHeight: 1 }}>6</span>
          </div>
        </div>

        {/* Wave bars */}
        <div style={{ display: "flex", alignItems: "end", gap: "clamp(1px,0.15vw,2px)", height: "clamp(9px,1.2vw,12px)" }}>
          {[3, 7, 11, 8, 5, 9, 6, 4, 7].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h}px`, `${h + 4}px`, `${h}px`] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.065, ease: "easeInOut" }}
              style={{ width: "clamp(1.5px,0.2vw,2.5px)", borderRadius: "9999px", background: i < 4 ? "#22c55e" : "rgba(34,197,94,0.35)" }}
            />
          ))}
        </div>

        <span className="text-xs" style={{ fontWeight: 600, color: "rgba(34,197,94,0.55)", lineHeight: 1 }}>
          8 / 20
        </span>
      </div>
    </div>
  );
}
