"use client";

import { motion } from "framer-motion";

export function RecordingWidgetHUD() {
  return (
    <div
      className="flex items-center gap-[8px] rounded-[11px] px-[9px] py-[6px]"
      style={{
        background: "rgba(14,4,4,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(239,68,68,0.28)",
        boxShadow: "0 0 10px rgba(239,68,68,0.08), inset 0 1px 0 rgba(239,68,68,0.08)",
      }}
    >
      {/* REC dot */}
      <motion.div
        className="rounded-full flex-shrink-0"
        animate={{ opacity: [1, 0.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{ width: "7px", height: "7px", background: "#ef4444", boxShadow: "0 0 7px rgba(239,68,68,0.9)", flexShrink: 0 }}
      />

      {/* Labels */}
      <div className="flex flex-col gap-[2px]">
        <span style={{ fontSize: "11px", fontWeight: 900, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: "0 0 8px rgba(239,68,68,0.65)", lineHeight: 1 }}>
          REC
        </span>
        <span style={{ fontSize: "7.5px", fontWeight: 700, color: "rgba(239,68,68,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.2 }}>
          SESSION RECORDING
        </span>
        {/* HD */}
        <div className="rounded-[3px] self-start px-[4px] py-[1px]" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)" }}>
          <span style={{ fontSize: "8px", fontWeight: 800, color: "#f87171", letterSpacing: "0.1em" }}>HD</span>
        </div>
      </div>
    </div>
  );
}
