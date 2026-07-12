"use client";

import { motion } from "framer-motion";

interface RecordingWidgetHUDProps {
  isRecording?: boolean;
  quality?: "HD" | "SD" | "FHD";
  duration?: string;
}

export function RecordingWidgetHUD({
  isRecording = true,
  quality = "HD",
  duration,
}: RecordingWidgetHUDProps) {
  if (!isRecording) return null;

  return (
    <div
      className="control-widget glass-panel"
      style={{
        background: "rgba(14,4,4,0.55)",
        border: "1px solid rgba(239,68,68,0.28)",
        boxShadow: "0 0 10px rgba(239,68,68,0.1), inset 0 1px 0 rgba(239,68,68,0.08)",
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
          boxShadow: "0 0 8px rgba(239,68,68,0.9)",
          flexShrink: 0,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)" }}>
          <span style={{ fontSize: "var(--text-md)", fontWeight: 900, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: "0 0 8px rgba(239,68,68,0.65)", lineHeight: 1 }}>
            REC
          </span>
          <div style={{ padding: "1px 4px", borderRadius: 4, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "#f87171" }}>{quality}</span>
          </div>
        </div>
        {duration && (
          <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(239,68,68,0.6)", letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" }}>
            {duration}
          </span>
        )}
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(239,68,68,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
          SESSION
        </span>
      </div>
    </div>
  );
}
