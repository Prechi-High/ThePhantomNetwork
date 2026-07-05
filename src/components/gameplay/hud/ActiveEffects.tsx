"use client";

import { motion } from "framer-motion";

interface Effect {
  id: string;
  label: string;
  time: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

const ACTIVE_EFFECTS: Effect[] = [
  {
    id: "steal_boost",
    label: "Steal Boost",
    time: "18s",
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.5)",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: "cloak",
    label: "Cloak",
    time: "12s",
    color: "#818cf8",
    glowColor: "rgba(129,140,248,0.5)",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z"
          fill="#818cf8"
        />
      </svg>
    ),
  },
  {
    id: "shield",
    label: "Shield",
    time: "8s",
    color: "#38bdf8",
    glowColor: "rgba(56,189,248,0.5)",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z"
          fill="#38bdf8"
        />
      </svg>
    ),
  },
];

export function ActiveEffects() {
  return (
    <div className="flex flex-col items-center gap-[5px]">
      <span
        style={{
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
        }}
      >
        ACTIVE EFFECTS
      </span>
      <div className="flex items-center gap-[6px]">
        {ACTIVE_EFFECTS.map((effect) => (
          <motion.div
            key={effect.id}
            className="flex items-center gap-[5px] rounded-full px-[10px] py-[5px]"
            animate={{ boxShadow: [`0 0 8px ${effect.glowColor}`, `0 0 16px ${effect.glowColor}`, `0 0 8px ${effect.glowColor}`] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: `linear-gradient(135deg,rgba(10,4,22,0.9),rgba(20,8,38,0.85))`,
              border: `1px solid ${effect.color}55`,
            }}
          >
            {/* Icon */}
            <div style={{ filter: `drop-shadow(0 0 4px ${effect.color}90)` }}>
              {effect.icon}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {effect.label}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: effect.color,
                lineHeight: 1,
                textShadow: `0 0 6px ${effect.color}80`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {effect.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
