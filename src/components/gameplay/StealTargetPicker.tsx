"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StealTarget } from "@/types/gameplay";

interface StealTargetPickerProps {
  targets: StealTarget[];
  onSelect: (target: StealTarget) => void;
  onCancel: () => void;
}

type RiskLevel = "high" | "medium" | "low";

interface EnrichedTarget extends StealTarget {
  risk: RiskLevel;
  isRival?: boolean;
  hasShield?: boolean;
  recentlyStole?: boolean;
  streak?: number;
}

function computeRisk(t: StealTarget): RiskLevel {
  if (t.tokens >= 10) return "low";   // high value = worth stealing
  if (t.tokens >= 5)  return "medium";
  return "high";
}

function riskLabel(r: RiskLevel) {
  return r === "low" ? "SAFE" : r === "medium" ? "MODERATE" : "RISKY";
}

function riskColor(r: RiskLevel) {
  return r === "low" ? "#22c55e" : r === "medium" ? "#f59e0b" : "#ef4444";
}

const AVATARS = ["👻", "🦇", "🐺", "🔥", "⚡", "💀", "🕶", "🌑"];
function targetAvatar(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATARS[Math.abs(h) % AVATARS.length];
}

function TargetCard({
  target,
  isSelected,
  onSelect,
}: {
  target: EnrichedTarget;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const rc = riskColor(target.risk);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      style={{
        background: isSelected
          ? "linear-gradient(135deg,rgba(239,68,68,0.2),rgba(88,28,135,0.25))"
          : "linear-gradient(135deg,rgba(14,8,30,0.85),rgba(5,3,12,0.9))",
        border: isSelected
          ? "1.5px solid rgba(239,68,68,0.7)"
          : "1px solid rgba(168,85,247,0.22)",
        borderRadius: 16,
        padding: "clamp(10px,1.4vw,14px)",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        boxShadow: isSelected
          ? "0 0 20px rgba(239,68,68,0.25)"
          : "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      {/* Rival pulse border */}
      {target.isRival && (
        <motion.div
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ position: "absolute", inset: 0, borderRadius: 16, border: "1.5px solid #ef4444", pointerEvents: "none" }}
        />
      )}

      {/* Recently stole flash */}
      {target.recentlyStole && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.12)", pointerEvents: "none", borderRadius: 16 }}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg,rgba(88,28,135,0.6),rgba(49,7,70,0.8))",
            border: `1.5px solid rgba(168,85,247,0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
            boxShadow: target.isRival ? "0 0 12px rgba(239,68,68,0.4)" : "none",
          }}>
            {targetAvatar(target.userId)}
          </div>
          {/* Shield indicator */}
          {target.hasShield && (
            <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, border: "1px solid rgba(56,189,248,0.6)" }}>
              🛡
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
              {target.username}
            </span>
            {target.isRival && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 9999, padding: "1px 6px", letterSpacing: "0.1em" }}>
                RIVAL
              </span>
            )}
          </div>

          {/* Token display — the prize */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#fcd34d,#f59e0b)", boxShadow: "0 0 8px rgba(251,191,36,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#78350f" }}>T</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24", fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: "0 0 10px rgba(251,191,36,0.5)" }}>
              {target.tokens}
            </span>
            <span style={{ fontSize: 9, color: "rgba(251,191,36,0.55)", fontWeight: 700 }}>TOKENS</span>
          </div>

          {/* Reason + risk row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {target.reason}
            </span>
            <div style={{
              padding: "1px 6px",
              borderRadius: 9999,
              background: `${rc}18`,
              border: `1px solid ${rc}55`,
            }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: rc, letterSpacing: "0.12em" }}>
                {riskLabel(target.risk)}
              </span>
            </div>
          </div>

          {/* Streak indicator */}
          {target.streak && target.streak > 0 && (
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 9 }}>🔥</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>{target.streak}× streak</span>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          border: isSelected ? "none" : "1.5px solid rgba(168,85,247,0.35)",
          background: isSelected ? "#ef4444" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 4,
          boxShadow: isSelected ? "0 0 10px rgba(239,68,68,0.5)" : "none",
        }}>
          {isSelected && <span style={{ fontSize: 10 }}>✓</span>}
        </div>
      </div>
    </motion.button>
  );
}

export function StealTargetPicker({ targets, onSelect, onCancel }: StealTargetPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const enriched: EnrichedTarget[] = targets.map(t => ({
    ...t,
    risk: computeRisk(t),
    isRival: t.tokens > 8,
    recentlyStole: false,
    streak: Math.floor(Math.random() * 4),
  }));

  // Auto-cancel countdown
  useEffect(() => {
    if (countdown <= 0) { onCancel(); return; }
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown, onCancel]);

  const handleConfirm = () => {
    const target = enriched.find(t => t.userId === selected);
    if (!target) return;
    setConfirmed(true);
    setTimeout(() => onSelect(target), 600);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(4,2,10,0.88)",
          backdropFilter: "blur(12px)",
          zIndex: 80,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: "0 0 env(safe-area-inset-bottom,0) 0",
        }}
        onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: confirmed ? "-4px" : 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "linear-gradient(180deg,rgba(14,6,28,0.98),rgba(5,2,12,0.99))",
            borderRadius: "24px 24px 0 0",
            border: "1px solid rgba(239,68,68,0.3)",
            borderBottom: "none",
            padding: "20px 16px 32px",
            boxShadow: "0 -20px 60px rgba(239,68,68,0.15)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#ef4444", letterSpacing: "0.05em", textShadow: "0 0 20px rgba(239,68,68,0.6)" }}>
                ⚡ STEAL
              </div>
              <div style={{ fontSize: 10, color: "rgba(239,68,68,0.6)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Choose your target
              </div>
            </div>
            {/* Countdown */}
            <motion.div
              animate={{ borderColor: countdown <= 5 ? ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.9)", "rgba(239,68,68,0.5)"] : "rgba(168,85,247,0.3)" }}
              transition={{ duration: 0.6, repeat: countdown <= 5 ? Infinity : 0 }}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(88,28,135,0.15)" }}
            >
              <span style={{ fontSize: 18, fontWeight: 900, color: countdown <= 5 ? "#ef4444" : "#c084fc", fontVariantNumeric: "tabular-nums" }}>
                {countdown}
              </span>
            </motion.div>
          </div>

          {/* Target cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: "52vh", overflowY: "auto" }}>
            <AnimatePresence>
              {enriched.map(t => (
                <TargetCard
                  key={t.userId}
                  target={t}
                  isSelected={selected === t.userId}
                  onSelect={() => setSelected(t.userId)}
                />
              ))}
            </AnimatePresence>

            {targets.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                No targets available
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid rgba(168,85,247,0.3)", background: "rgba(88,28,135,0.12)", fontSize: 12, fontWeight: 700, color: "rgba(168,85,247,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
            >
              CANCEL
            </motion.button>

            <motion.button
              whileHover={selected ? { scale: 1.02 } : undefined}
              whileTap={selected ? { scale: 0.97 } : undefined}
              onClick={handleConfirm}
              disabled={!selected}
              animate={selected ? { boxShadow: ["0 0 8px rgba(239,68,68,0.3)", "0 0 20px rgba(239,68,68,0.6)", "0 0 8px rgba(239,68,68,0.3)"] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                flex: 2,
                padding: "12px 0",
                borderRadius: 12,
                border: `1.5px solid ${selected ? "#ef4444" : "rgba(107,114,128,0.3)"}`,
                background: selected ? "linear-gradient(135deg,rgba(239,68,68,0.25),rgba(127,29,29,0.3))" : "rgba(17,17,17,0.5)",
                fontSize: 13,
                fontWeight: 900,
                color: selected ? "#ef4444" : "rgba(107,114,128,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: selected ? "pointer" : "not-allowed",
                textShadow: selected ? "0 0 12px rgba(239,68,68,0.6)" : "none",
              }}
            >
              {confirmed ? "LOCKING..." : "CONFIRM TARGET"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
