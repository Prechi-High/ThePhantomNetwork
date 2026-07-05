"use client";

import { motion } from "framer-motion";

export function RecordingWidgetHUD() {
  return (
    <div
      className="control-widget glass-panel"
      style={{
        background: "rgba(14,4,4,0.55)",
        border: "1px solid rgba(239,68,68,0.28)",
        boxShadow: "0 0 10px rgba(239,68,68,0.08), inset 0 1px 0 rgba(239,68,68,0.08)",
      }}
    >
      {/* REC dot */}
      <motion.div
        animate={{ opacity: [1, 0.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{
          width: "clamp(6px, 0.8vw, 9px)",
          height: "clamp(6px, 0.8vw, 9px)",
          borderRadius: "50%",
          background: "#ef4444",
          boxShadow: "0 0 7px rgba(239,68,68,0.9)",
          flexShrink: 0,
        }}
      />

      {/* Labels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        <span
          className="text-md"
          style={{
            fontWeight: 900,
            color: "#ef4444",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(239,68,68,0.65)",
            lineHeight: 1,
          }}
        >
          REC
        </span>
        <span
          className="text-xs"
          style={{
            fontWeight: 700,
            color: "rgba(239,68,68,0.55)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          SESSION RECORDING
        </span>
        {/* HD */}
        <div
          style={{
            borderRadius: "clamp(2px, 0.3vw, 4px)",
            alignSelf: "start",
            padding: "clamp(1px, 0.1vw, 2px) clamp(3px, 0.4vw, 5px)",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
          }}
        >
          <span
            className="text-xs"
            style={{ fontWeight: 800, color: "#f87171", letterSpacing: "0.1em" }}
          >
            HD
          </span>
        </div>
      </div>
    </div>
  );
}
