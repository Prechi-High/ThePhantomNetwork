"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VoiceWidgetHUDProps {
  activeCount?: number;
  maxCount?: number;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isDisconnected?: boolean;
}

export function VoiceWidgetHUD({
  activeCount = 8,
  maxCount = 20,
  isSpeaking = false,
  isMuted = false,
  isDisconnected = false,
}: VoiceWidgetHUDProps) {
  const statusColor = isDisconnected ? "#ef4444" : isMuted ? "#f59e0b" : "#22c55e";
  const statusLabel = isDisconnected ? "OFFLINE" : isMuted ? "MUTED" : "ACTIVE";

  return (
    <div
      className="control-widget glass-panel"
      style={{
        background: isDisconnected ? "rgba(14,4,4,0.55)" : "rgba(4,14,8,0.55)",
        border: `1px solid ${statusColor}44`,
        boxShadow: `0 0 10px ${statusColor}18, inset 0 1px 0 ${statusColor}12`,
        flex: 1,
      }}
    >
      {/* Mic icon with speaking ring */}
      <div style={{ position: "relative", width: "clamp(20px, 2.5vw, 26px)", height: "clamp(20px, 2.5vw, 26px)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Speaking pulse ring */}
        {isSpeaking && !isMuted && (
          <motion.div
            animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: `1px solid ${statusColor}` }}
          />
        )}
        {/* Mic svg */}
        <svg width="clamp(11px, 1.4vw, 14px)" height="clamp(11px, 1.4vw, 14px)" viewBox="0 0 24 24" fill="none">
          {isMuted ? (
            <>
              <rect x="9" y="3" width="6" height="11" rx="3" fill="rgba(245,158,11,0.5)" />
              <path d="M5 11v1a7 7 0 0014 0v-1" stroke="rgba(245,158,11,0.5)" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x="9" y="3" width="6" height="11" rx="3" fill={statusColor} />
              <path d="M5 11v1a7 7 0 0014 0v-1" stroke={statusColor} strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke={statusColor} strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>

      {/* Right section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px, 0.3vw, 3px)", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: statusColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            VOICE
          </span>
          <div style={{ padding: "1px 5px", borderRadius: 9999, background: `${statusColor}22`, border: `1px solid ${statusColor}44` }}>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 900, color: statusColor, lineHeight: 1 }}>{statusLabel}</span>
          </div>
          <span style={{ fontSize: "var(--text-2xs)", color: "rgba(34,197,94,0.5)", marginLeft: "auto" }}>{activeCount}/{maxCount}</span>
        </div>

        {/* Waveform bars */}
        {!isDisconnected && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(1px, 0.15vw, 2px)", height: "clamp(8px, 1vw, 11px)" }}>
            {[3, 7, 11, 8, 5, 9, 6, 4, 8, 5].map((h, i) => (
              <motion.div
                key={i}
                animate={isSpeaking && !isMuted
                  ? { height: [`${h}px`, `${h + 5}px`, `${h}px`] }
                  : { height: `${Math.max(2, h * 0.3)}px` }
                }
                transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0, delay: i * 0.06, ease: "easeInOut" }}
                style={{
                  width: "clamp(1.5px, 0.2vw, 2.5px)",
                  borderRadius: 9999,
                  background: i < 5 ? statusColor : `${statusColor}44`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
