"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEffectsStore, type ActiveEffect } from "@/stores/useEffectsStore";
import { useEffectsUpdates } from "@/hooks/useEffectsUpdates";
import { useServerTime } from "@/hooks/useServerTime";

// Map effect types to display properties
const EFFECT_CONFIG: Record<string, { color: string; glowColor: string; icon: React.ReactNode }> = {
  shield: {
    color: "#38bdf8",
    glowColor: "rgba(56,189,248,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z" fill="#38bdf8" />
      </svg>
    ),
  },
  cloak: {
    color: "#818cf8",
    glowColor: "rgba(129,140,248,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z" fill="#818cf8" />
      </svg>
    ),
  },
  multiplier: {
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
  insurance: {
    color: "#fbbf24",
    glowColor: "rgba(251,191,36,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12H21C21 7 17 3 12 3Z" fill="#fbbf24" />
        <line x1="12" y1="12" x2="12" y2="19" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function ActiveEffects() {
  const { currentUserId, subSessionId } = useSessionStore();
  const effects = useEffectsStore((s) => s.effects);
  const serverTime = useServerTime();

  // Subscribe to effects updates
  useEffectsUpdates(currentUserId, subSessionId);

  if (effects.length === 0) return null;

  return (
    <div className="effects-container">
      <span
        className="text-xs"
        style={{
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
        }}
      >
        ACTIVE EFFECTS
      </span>
      <div className="effects-row">
        {effects.map((effect) => {
          const config = EFFECT_CONFIG[effect.type] || EFFECT_CONFIG.shield;
          const remainingMs = serverTime.getCountdown(effect.expires_at);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          const isExpiring = remainingSeconds <= 3;

          return (
            <motion.div
              key={effect.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                boxShadow: [
                  `0 0 8px ${config.glowColor}`,
                  `0 0 14px ${config.glowColor}`,
                  `0 0 8px ${config.glowColor}`,
                ],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                layout: { duration: 0.3 },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="effect-pill"
              style={{
                background: "rgba(10,4,22,0.65)",
                border: `1px solid ${config.color}44`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ filter: `drop-shadow(0 0 3px ${config.color}80)` }}>
                {config.icon}
              </div>
              <span
                className="text-md"
                style={{ fontWeight: 700, color: "#fff", lineHeight: 1 }}
              >
                {effect.name}
              </span>
              <motion.span
                key={`${effect.id}-${remainingSeconds}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-md"
                style={{
                  fontWeight: 700,
                  color: isExpiring ? "#ef4444" : config.color,
                  lineHeight: 1,
                  textShadow: `0 0 5px ${config.color}70`,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {remainingSeconds}s
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
