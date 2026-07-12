"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEffectsStore } from "@/stores/useEffectsStore";
import { useEffectsUpdates } from "@/hooks/useEffectsUpdates";
import { useServerTime } from "@/hooks/useServerTime";

interface EffectDisplay {
  color: string;
  glow: string;
  icon: string;
  label: string;
  ringColor: string;
}

const EFFECT_DISPLAY: Record<string, EffectDisplay> = {
  shield:     { color: "#38bdf8", glow: "rgba(56,189,248,0.5)",   icon: "🛡", label: "SHIELD",     ringColor: "#38bdf8" },
  cloak:      { color: "#818cf8", glow: "rgba(129,140,248,0.5)",  icon: "👤", label: "CLOAK",      ringColor: "#818cf8" },
  multiplier: { color: "#a855f7", glow: "rgba(168,85,247,0.5)",   icon: "✕", label: "MULTI",      ringColor: "#a855f7" },
  insurance:  { color: "#fbbf24", glow: "rgba(251,191,36,0.5)",   icon: "☂", label: "INSURANCE",  ringColor: "#fbbf24" },
  boost:      { color: "#f97316", glow: "rgba(249,115,22,0.5)",   icon: "⚡", label: "BOOST",      ringColor: "#f97316" },
};
const DEFAULT_EFFECT: EffectDisplay = { color: "#a855f7", glow: "rgba(168,85,247,0.4)", icon: "✦", label: "EFFECT", ringColor: "#a855f7" };

export function ActiveEffects() {
  const { subSessionId } = useSessionStore();
  const effects = useEffectsStore((s) => s.effects);
  const serverTime = useServerTime();

  useEffectsUpdates(null, subSessionId);

  if (effects.length === 0) return null;

  return (
    <div className="zone-effects">
      <div className="effects-container">
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          EFFECTS
        </span>

        <div className="effects-row">
          <AnimatePresence mode="popLayout">
            {effects.map((effect) => {
              const d = EFFECT_DISPLAY[effect.type] ?? DEFAULT_EFFECT;
              const remainingMs = serverTime.getCountdown(effect.expires_at);
              const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
              const isExpiring = remainingSec <= 5;
              const totalSec = 30; // Approximate for progress ring
              const pct = Math.min(1, remainingMs / (totalSec * 1000));
              const circumference = 2 * Math.PI * 9;
              const dashOffset = circumference * (1 - pct);

              return (
                <motion.div
                  key={effect.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    boxShadow: [
                      `0 0 6px ${d.glow}`,
                      `0 0 14px ${d.glow}`,
                      `0 0 6px ${d.glow}`,
                    ],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    layout: { duration: 0.3 },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="effect-pill"
                  style={{
                    background: "rgba(10,4,22,0.7)",
                    border: `1px solid ${d.color}44`,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* Animated countdown ring */}
                  <div style={{ position: "relative", width: 20, height: 20, flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: "absolute", inset: 0 }}>
                      {/* Track */}
                      <circle cx="10" cy="10" r="9" fill="none" stroke={`${d.color}22`} strokeWidth="1.5" />
                      {/* Progress */}
                      <motion.circle
                        cx="10" cy="10" r="9"
                        fill="none"
                        stroke={isExpiring ? "#ef4444" : d.color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                      />
                    </svg>
                    {/* Icon centre */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                      {d.icon}
                    </div>
                  </div>

                  {/* Label */}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "0.08em" }}>
                    {effect.name || d.label}
                  </span>

                  {/* Countdown */}
                  <motion.span
                    key={remainingSec}
                    initial={{ scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 800,
                      color: isExpiring ? "#ef4444" : d.color,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      textShadow: `0 0 6px ${d.color}70`,
                    }}
                  >
                    {remainingSec}s
                  </motion.span>

                  {/* Expiring flash */}
                  {isExpiring && (
                    <motion.div
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.15)", borderRadius: "inherit", pointerEvents: "none" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
