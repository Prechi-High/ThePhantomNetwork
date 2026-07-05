"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Effect {
  id: string;
  label: string;
  duration: number; // seconds remaining
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

const INITIAL_EFFECTS: Effect[] = [
  {
    id: "steal_boost",
    label: "Steal Boost",
    duration: 18,
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: "cloak",
    label: "Cloak",
    duration: 12,
    color: "#818cf8",
    glowColor: "rgba(129,140,248,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z" fill="#818cf8" />
      </svg>
    ),
  },
  {
    id: "shield",
    label: "Shield",
    duration: 8,
    color: "#38bdf8",
    glowColor: "rgba(56,189,248,0.45)",
    icon: (
      <svg width="clamp(10px, 1.2vw, 13px)" height="clamp(10px, 1.2vw, 13px)" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z" fill="#38bdf8" />
      </svg>
    ),
  },
];

export function ActiveEffects() {
  const [effects, setEffects] = useState<Effect[]>(INITIAL_EFFECTS);

  // Countdown timer - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setEffects((prev) =>
        prev
          .map((effect) => ({ ...effect, duration: effect.duration - 1 }))
          .filter((effect) => effect.duration > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: [
                `0 0 8px ${effect.glowColor}`,
                `0 0 14px ${effect.glowColor}`,
                `0 0 8px ${effect.glowColor}`,
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
              border: `1px solid ${effect.color}44`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ filter: `drop-shadow(0 0 3px ${effect.color}80)` }}>
              {effect.icon}
            </div>
            <span
              className="text-md"
              style={{ fontWeight: 700, color: "#fff", lineHeight: 1 }}
            >
              {effect.label}
            </span>
            <motion.span
              key={effect.duration}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-md"
              style={{
                fontWeight: 700,
                color: effect.duration <= 3 ? "#ef4444" : effect.color,
                lineHeight: 1,
                textShadow: `0 0 5px ${effect.color}70`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {effect.duration}s
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
