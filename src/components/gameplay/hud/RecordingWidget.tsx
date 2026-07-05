"use client";

import { motion } from "framer-motion";

export function RecordingWidgetHUD() {
  return (
    <div
      className="flex flex-col items-center gap-[5px] rounded-[14px] px-[10px] py-[9px]"
      style={{
        background: "linear-gradient(135deg,rgba(20,4,4,0.92) 0%,rgba(30,6,6,0.88) 100%)",
        border: "1px solid rgba(239,68,68,0.35)",
        boxShadow:
          "0 0 14px rgba(239,68,68,0.12), inset 0 1px 0 rgba(239,68,68,0.1)",
        minWidth: "80px",
      }}
    >
      {/* REC indicator */}
      <div className="flex items-center gap-[5px]">
        <motion.div
          className="rounded-full"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            width: "8px",
            height: "8px",
            background: "#ef4444",
            boxShadow: "0 0 8px rgba(239,68,68,0.9)",
          }}
        />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 900,
            color: "#ef4444",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "0 0 10px rgba(239,68,68,0.7)",
          }}
        >
          REC
        </span>
      </div>

      {/* SESSION RECORDING label */}
      <span
        style={{
          fontSize: "8px",
          fontWeight: 700,
          color: "rgba(239,68,68,0.6)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        SESSION
        <br />
        RECORDING
      </span>

      {/* HD badge */}
      <div
        className="rounded-[4px] px-[5px] py-[2px]"
        style={{
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.5)",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            fontWeight: 800,
            color: "#f87171",
            letterSpacing: "0.12em",
          }}
        >
          HD
        </span>
      </div>
    </div>
  );
}
