"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { PremiumSpinWheel } from "@/components/gameplay/premium-wheel";
import { OUTCOME_CONFIG } from "@/config/spinConfig";

interface WheelHUDProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  tokenAmount?: number;
  onSpinComplete: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
  /** Consecutive win streak */
  streak?: number;
  /** Combo multiplier e.g. 1.5 */
  combo?: number;
  /** 0-100 momentum score */
  momentum?: number;
  /** Last 3 outcomes for preview strip */
  recentOutcomes?: SpinOutcome[];
}

const OUTCOME_SHORT: Record<SpinOutcome, string> = {
  ADVANCE: "ADV",
  ACQUIRE: "ACQ",
  DISCOVER: "DIS",
  STEAL: "STL",
  VOID: "VOD",
};

function OutcomeChip({ outcome }: { outcome: SpinOutcome }) {
  const cfg = OUTCOME_CONFIG[outcome];
  return (
    <div
      style={{
        padding: "1px 6px",
        borderRadius: 9999,
        border: `1px solid ${cfg.primary}55`,
        background: `${cfg.primary}15`,
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span style={{ fontSize: 8 }}>{cfg.icon}</span>
      <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: cfg.primary, letterSpacing: "0.1em" }}>
        {OUTCOME_SHORT[outcome]}
      </span>
    </div>
  );
}

export function WheelHUD({
  isSpinning,
  outcome,
  tokenAmount = 0,
  onSpinComplete,
  onTokensAwarded,
  onStealActivated,
  streak = 0,
  combo = 1,
  momentum = 0,
  recentOutcomes = [],
}: WheelHUDProps) {
  const subSessionId = typeof window !== "undefined"
    ? undefined
    : undefined;

  const hasStreak = streak >= 2;
  const hasCombo = combo > 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(4px, 0.5vw, 6px)",
      }}
    >
      {/* ---- Streak + Combo badges above wheel ---- */}
      <div style={{ display: "flex", gap: "clamp(4px, 0.5vw, 6px)", alignItems: "center", flexShrink: 0, minHeight: 20 }}>
        <AnimatePresence>
          {hasStreak && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                padding: "2px 8px",
                borderRadius: 9999,
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 10 }}>🔥</span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "#f59e0b" }}>
                {streak}× STREAK
              </span>
            </motion.div>
          )}
          {hasCombo && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                padding: "2px 8px",
                borderRadius: 9999,
                background: "rgba(168,85,247,0.15)",
                border: "1px solid rgba(168,85,247,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 900, color: "#c084fc" }}>
                {combo}× COMBO
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Wheel ---- */}
      <div className="wheel-core" style={{ flexShrink: 0 }}>
        <PremiumSpinWheel
          isSpinning={isSpinning}
          outcome={outcome}
          tokenAmount={tokenAmount}
          onSpinComplete={onSpinComplete}
          onTokensAwarded={onTokensAwarded}
          onStealActivated={onStealActivated}
        />
      </div>

      {/* ---- Momentum bar below wheel ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(4px, 0.5vw, 6px)",
          width: "var(--wheel-size)",
          maxWidth: "100%",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "rgba(168,85,247,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>
          MOM
        </span>
        <div style={{ flex: 1, height: "clamp(3px, 0.4vw, 5px)", borderRadius: 9999, overflow: "hidden", background: "rgba(88,28,135,0.25)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <motion.div
            animate={{ width: `${momentum}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: "100%",
              borderRadius: 9999,
              background: `linear-gradient(90deg, #581c87, #a855f7 ${momentum}%, #c084fc)`,
              boxShadow: "0 0 6px rgba(168,85,247,0.7)",
            }}
          />
        </div>
        {/* Recent outcomes strip */}
        {recentOutcomes.length > 0 && (
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {recentOutcomes.slice(-3).map((o, i) => (
              <OutcomeChip key={i} outcome={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
