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
  rankingPercentile?: number;
  phaseEndsAt?: number | null;
  surgePercent?: number;
  connectionQuality?: "good" | "degraded" | "poor";
  isSynced?: boolean;
}

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
  rankingPercentile = 0,
  phaseEndsAt,
  surgePercent = 0,
  connectionQuality = "good",
  isSynced = true,
}: TopHUDProps) {
  const remaining = usePhaseTimer(phaseEndsAt ?? null);
  const timerStr = phaseEndsAt ? formatTimer(remaining) : "—:——";
  const isUrgent = remaining > 0 && remaining < 30_000;
  const prizeStr = `$${(prizePoolCents / 100).toLocaleString()}`;
  const connColor = CONNECTION_COLORS[connectionQuality];
  const surgeClamped = Math.max(0, Math.min(100, surgePercent));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.5vw, 6px)" }}>
      <div className="top-hud-grid">
        {/* Prize Pool */}
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

        {/* Phase + Timer + Surge preview */}
        <div className="col-span-6 glass-panel top-card" style={{ alignItems: "center", gap: "clamp(2px, 0.3vw, 4px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.6vw, 7px)" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.16em", color: "#c084fc", textTransform: "uppercase" }}>
              PHASE {phase}/{totalPhases}
            </span>
            <div style={{ display: "flex", gap: "clamp(3px, 0.4vw, 5px)", alignItems: "center" }}>
              {Array.from({ length: totalPhases }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i + 1 === phase ? "clamp(14px, 1.8vw, 20px)" : "clamp(5px, 0.65vw, 7px)",
                    background: i + 1 < phase ? "#7c3aed" : i + 1 === phase ? "linear-gradient(90deg,#a855f7,#c084fc)" : "rgba(168,85,247,0.15)",
                    boxShadow: i + 1 === phase ? "0 0 7px rgba(168,85,247,0.8)" : "none",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ height: "clamp(5px, 0.65vw, 7px)", borderRadius: 9999 }}
                />
              ))}
            </div>
          </div>

          <motion.div animate={isUrgent ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.8, repeat: isUrgent ? Infinity : 0 }}>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 900, letterSpacing: "0.05em", color: isUrgent ? "#ef4444" : "#ffffff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {timerStr}
            </span>
          </motion.div>

          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "#c084fc", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
              NEXT: SHADOW SURGE
            </span>
            <div className="surge-bar" style={{ flex: 1, height: "clamp(4px, 0.5vw, 6px)" }}>
              <motion.div
                animate={{ width: `${surgeClamped}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 9999, background: "linear-gradient(90deg,#581c87,#a855f7,#c084fc)", boxShadow: "0 0 8px rgba(168,85,247,0.7)" }}
              />
            </div>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "#c084fc", minWidth: 28, textAlign: "right" }}>{surgeClamped}%</span>
          </div>
        </div>

        {/* Alive + Rank */}
        <div className="col-span-3 glass-panel top-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <AnimatedNumber value={alivePlayers} style={{ fontSize: "var(--text-xl)", fontWeight: 900, color: "#fff", lineHeight: 1 }} />
              <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(168,85,247,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block" }}>ALIVE</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <AnimatedNumber
                value={playerRank || "—"}
                suffix={playerRank ? rankSuffix(playerRank) : ""}
                style={{ fontSize: "var(--text-xl)", fontWeight: 900, color: "#fbbf24", lineHeight: 1, textShadow: "0 0 8px rgba(251,191,36,0.5)" }}
              />
              <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(251,191,36,0.7)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block" }}>MY RANK</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 10 }}>
              {[4, 6, 8, 10].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i < { good: 4, degraded: 2, poor: 1 }[connectionQuality]! ? connColor : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
            <span style={{ fontSize: "var(--text-2xs)", color: isSynced ? "rgba(34,197,94,0.6)" : "rgba(245,158,11,0.8)", fontWeight: 700 }}>
              {isSynced ? "SYNCED" : "SYNCING"}
            </span>
          </div>
        </div>
      </div>

      {/* My Tokens row */}
      <div className="glass-panel top-card" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "clamp(6px, 0.8vw, 10px) clamp(10px, 1.2vw, 14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#581c87)", border: "1.5px solid rgba(168,85,247,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 10px rgba(168,85,247,0.4)" }}>
            👻
          </div>
          <div>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "rgba(192,132,252,0.7)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block" }}>MY TOKENS</span>
            <AnimatedNumber value={tokens} style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.5)", lineHeight: 1 }} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block" }}>RANKING</span>
          <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "#c084fc", textShadow: "0 0 8px rgba(192,132,252,0.4)" }}>
            TOP {rankingPercentile || "—"}%
          </span>
        </div>
      </div>
    </div>
  );
}
