"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ShadowSurgeProps {
  percent: number;
  playerRank?: number;
}

/**
 * ShadowSurge — Psychological progression energy core.
 *
 * As surge fills:
 *   Core glows brighter → energy leaks → pulse accelerates
 *
 * Design intent: Players should WANT to fill it.
 * The bar is not a bar — it's an energy core.
 */
export function ShadowSurge({ percent, playerRank = 7 }: ShadowSurgeProps) {
  const clampedPct = Math.max(0, Math.min(100, percent));
  const suffix = playerRank === 1 ? "st" : playerRank === 2 ? "nd" : playerRank === 3 ? "rd" : "th";

  // Pulse speed increases as surge fills
  const pulseDuration = 2.8 - (clampedPct / 100) * 1.6; // 2.8s → 1.2s

  // Glow intensity scales with fill
  const glowPx = 6 + (clampedPct / 100) * 20;

  return (
    <div className="zone-surge" style={{ paddingInline: 0, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px, 0.3vw, 3px)", width: "100%" }}>

        {/* Label row */}
        <div className="surge-section">
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.5vw, 6px)" }}>
            {/* Energy bolt icon */}
            <motion.div
              animate={{
                filter: [
                  `drop-shadow(0 0 ${glowPx * 0.5}px rgba(168,85,247,0.7))`,
                  `drop-shadow(0 0 ${glowPx}px rgba(168,85,247,0.9))`,
                  `drop-shadow(0 0 ${glowPx * 0.5}px rgba(168,85,247,0.7))`,
                ],
              }}
              transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="clamp(8px, 1vw, 11px)" height="clamp(8px, 1vw, 11px)" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
              </svg>
            </motion.div>
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 800,
                letterSpacing: "0.16em",
                color: "#c084fc",
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(192,132,252,0.55)",
              }}
            >
              SHADOW SURGE
            </span>
          </div>

          {/* Rank */}
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              color: "rgba(192,132,252,0.65)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            #{playerRank}{suffix}
          </span>
        </div>

        {/* Bar + percent */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(5px, 0.7vw, 8px)" }}>
          <div className="surge-bar" style={{ flex: 1 }}>

            {/* Segment ticks */}
            {[25, 50, 75].map((p) => (
              <div
                key={p}
                style={{
                  position: "absolute",
                  top: 0, bottom: 0,
                  left: `${p}%`,
                  width: 1,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 3,
                }}
              />
            ))}

            {/* Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedPct}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                borderRadius: 9999,
                background: "linear-gradient(90deg,#581c87,#7c3aed,#a855f7,#c084fc)",
                boxShadow: `0 0 ${glowPx}px rgba(168,85,247,0.85), 0 0 3px rgba(192,132,252,0.5)`,
              }}
            >
              {/* Shine sweep */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 9999,
                  background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)",
                }}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Energy leak particles at fill edge — appear above ~60% */}
            {clampedPct >= 60 && (
              <motion.div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${clampedPct}%`,
                  transform: "translate(-50%, -50%)",
                  width: "clamp(6px, 0.8vw, 10px)",
                  height: "clamp(6px, 0.8vw, 10px)",
                  borderRadius: "50%",
                  background: "#c084fc",
                  zIndex: 4,
                }}
                animate={{
                  boxShadow: [
                    "0 0 4px 2px rgba(192,132,252,0.5)",
                    `0 0 ${glowPx}px 4px rgba(192,132,252,0.9)`,
                    "0 0 4px 2px rgba(192,132,252,0.5)",
                  ],
                }}
                transition={{ duration: pulseDuration * 0.7, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          {/* Percent label */}
          <motion.span
            key={clampedPct}
            initial={{ scale: 1.3, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 800,
              color: "#c084fc",
              letterSpacing: "0.04em",
              minWidth: "clamp(26px, 3vw, 34px)",
              textAlign: "right",
              textShadow: `0 0 ${glowPx * 0.5}px rgba(192,132,252,0.6)`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {clampedPct}%
          </motion.span>
        </div>
      </div>
    </div>
  );
}
