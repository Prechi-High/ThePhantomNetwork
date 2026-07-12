"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";

interface TopHUDProps {
  prizePoolCents: number;
  phase: number;
  totalPhases: number;
  tokens: number;
  playerRank: number;
  alivePlayers: number;
  phaseEndsAt?: number | null;
  connectionQuality?: "good" | "degraded" | "poor";
  isSynced?: boolean;
}

/** Animated numeric counter — counts up/down to new value */
function AnimatedNumber({
  value,
  style,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number | string;
  style?: React.CSSProperties;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setDisplay(value);
  }, [value]);

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={String(value)}
        initial={{ y: -12, opacity: 0, filter: "blur(2px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: 12, opacity: 0, filter: "blur(2px)" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "inline-block", ...style }}
        className={className}
      >
        {prefix}{display}{suffix}
      </motion.span>
    </AnimatePresence>
  );
}

/** Pulse dot that glows on change */
function LiveDot({ color = "#22c55e" }: { color?: string }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: "clamp(5px, 0.6vw, 7px)",
        height: "clamp(5px, 0.6vw, 7px)",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}

function formatTimer(ms: number): string {
  if (ms <= 0) return "00:00";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function rankSuffix(r: number): string {
  return r === 1 ? "st" : r === 2 ? "nd" : r === 3 ? "rd" : "th";
}

const CONNECTION_COLORS: Record<string, string> = {
  good: "#22c55e",
  degraded: "#f59e0b",
  poor: "#ef4444",
};

export function TopHUD({
  prizePoolCents,
  phase,
  totalPhases,
  tokens,
  playerRank,
  alivePlayers,
  phaseEndsAt,
  connectionQuality = "good",
  isSynced = true,
}: TopHUDProps) {
  const remaining = usePhaseTimer(phaseEndsAt ?? null);
  const timerStr = phaseEndsAt ? formatTimer(remaining) : "—:——";
  const isUrgent = remaining > 0 && remaining < 30_000;
  const prizeStr = `$${(prizePoolCents / 100).toLocaleString()}`;
  const connColor = CONNECTION_COLORS[connectionQuality];

  return (
    <div className="top-hud-grid">

      {/* ---- Prize Pool (3 cols) ---- */}
      <div className="col-span-3 glass-panel top-card">
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)", marginBottom: "clamp(2px, 0.3vw, 3px)" }}>
          <LiveDot color="#22c55e" />
          <span className="top-card-label" style={{ color: "#22c55e" }}>PRIZE POOL</span>
        </div>
        <AnimatedNumber
          value={prizeStr}
          className="top-card-value"
          style={{ color: "#22c55e", textShadow: "0 0 14px rgba(34,197,94,0.6)" }}
        />
      </div>

      {/* ---- Phase + Timer (6 cols center) ---- */}
      <div className="col-span-6 glass-panel top-card" style={{ alignItems: "center", gap: 0 }}>
        {/* Phase label + dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.6vw, 7px)", marginBottom: "clamp(2px, 0.3vw, 3px)" }}>
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#c084fc",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(192,132,252,0.5)",
            }}
          >
            PHASE
          </span>
          {/* Phase progress dots */}
          <div style={{ display: "flex", gap: "clamp(3px, 0.4vw, 5px)", alignItems: "center" }}>
            {Array.from({ length: totalPhases }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i + 1 === phase ? "clamp(14px, 1.8vw, 20px)" : "clamp(5px, 0.65vw, 7px)",
                  background: i + 1 < phase
                    ? "#7c3aed"
                    : i + 1 === phase
                    ? "linear-gradient(90deg,#a855f7,#c084fc)"
                    : "rgba(168,85,247,0.15)",
                  boxShadow: i + 1 === phase ? "0 0 7px rgba(168,85,247,0.8)" : "none",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ height: "clamp(5px, 0.65vw, 7px)", borderRadius: 9999 }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 800,
              color: "rgba(192,132,252,0.6)",
              letterSpacing: "0.1em",
            }}
          >
            {phase}/{totalPhases}
          </span>
        </div>

        {/* Timer */}
        <motion.div
          animate={isUrgent ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: isUrgent ? Infinity : 0 }}
        >
          <span
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 900,
              letterSpacing: "0.05em",
              color: isUrgent ? "#ef4444" : "#ffffff",
              fontVariantNumeric: "tabular-nums",
              textShadow: isUrgent
                ? "0 0 20px rgba(239,68,68,0.7)"
                : "0 0 16px rgba(255,255,255,0.2)",
              lineHeight: 1,
            }}
          >
            {timerStr}
          </span>
        </motion.div>

        {/* Connection + Sync row */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(5px, 0.7vw, 8px)", marginTop: "clamp(2px, 0.3vw, 4px)" }}>
          {/* Connection quality */}
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: 10 }}>
            {[4, 6, 8, 10].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 2,
                  background: i < { good: 4, degraded: 2, poor: 1 }[connectionQuality]!
                    ? connColor
                    : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
          {/* Server sync */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <motion.div
              animate={isSynced ? {} : { rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{ width: 8, height: 8, opacity: isSynced ? 0.7 : 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="8" height="8">
                <path d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z" fill={isSynced ? "#22c55e" : "#f59e0b"} />
              </svg>
            </motion.div>
            <span style={{ fontSize: "var(--text-2xs)", color: isSynced ? "rgba(34,197,94,0.6)" : "rgba(245,158,11,0.8)", fontWeight: 700 }}>
              {isSynced ? "SYNCED" : "SYNCING"}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Tokens + Rank + Alive (3 cols) ---- */}
      <div className="col-span-3 glass-panel top-card">
        {/* My Tokens */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)", marginBottom: "clamp(2px, 0.3vw, 3px)" }}>
          <div
            style={{
              width: "clamp(12px, 1.5vw, 16px)",
              height: "clamp(12px, 1.5vw, 16px)",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#fcd34d,#f59e0b)",
              boxShadow: "0 0 7px rgba(251,191,36,0.6)",
              flexShrink: 0,
            }}
          />
          <span className="top-card-label" style={{ color: "rgba(251,191,36,0.8)" }}>TOKENS</span>
        </div>
        <AnimatedNumber
          value={tokens}
          className="top-card-value"
          style={{ color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.6)", lineHeight: 1 }}
        />

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)", margin: "clamp(3px, 0.4vw, 5px) 0" }} />

        {/* Alive + Rank inline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <AnimatedNumber
              value={alivePlayers}
              style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "#fff", lineHeight: 1 }}
            />
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(168,85,247,0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>ALIVE</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(168,85,247,0.2)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <AnimatedNumber
              value={playerRank}
              suffix={rankSuffix(playerRank)}
              style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "#c084fc", lineHeight: 1, textShadow: "0 0 8px rgba(192,132,252,0.5)" }}
            />
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(168,85,247,0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>RANK</span>
          </div>
        </div>
      </div>

    </div>
  );
}
