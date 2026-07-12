"use client";

/**
 * GameplayArena — The Stage Director
 *
 * Orchestrates the player experience — not gameplay logic.
 * Controls: arena state, cinematic transitions, overlays,
 * environmental lighting, background reactions, focus management.
 *
 * Arena reacts to gameplay phase:
 *   waiting      → dark atmosphere, ambient motion
 *   active       → full illumination, dynamic depth
 *   steal        → environment darkens, target highlighted
 *   revive       → heartbeat lighting, squad focus
 *   championship → maximum energy, leaderboard expands
 *   results      → arena relaxes, victory lighting
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumSpinWheel, ButtonAnimator } from "@/components/gameplay/premium-wheel";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { FireBoostMeter } from "@/components/gameplay/FireBoostMeter";
import { RevivePanel } from "@/components/gameplay/RevivePanel";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";
import type { SpinOutcome, StealTarget } from "@/types/gameplay";

// ── Types ──────────────────────────────────────────────────────────────────

export type ArenaMode =
  | "waiting"
  | "active"
  | "steal"
  | "revive"
  | "championship"
  | "results";

interface SquadMember {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface LeaderboardEntry {
  user_id: string;
  session_tokens: number;
  profiles?: { username: string } | null;
}

interface GameplayArenaProps {
  phase: number;
  round: number;
  maxRounds: number;
  phaseEndsAt: number | null;
  tokens: number;
  playerRank: number;
  totalPlayers: number;
  isEliminated: boolean;
  isRevivable: boolean;
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  squadMembers: SquadMember[];
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  showStealPicker: boolean;
  stealTargets: StealTarget[];
  stealInProgress: boolean;
  attackerId: string | null;
  fireBoostTaps: number;
  reviveTargetId: string | null;
  totalPoolCents?: number | null;
  onSpin: () => void;
  onSpinComplete: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
  onStealSelect: (target: StealTarget) => void;
  onStealCancel: () => void;
  onResolveSteal: () => void;
  onFireBoost: () => void;
  onReviveContribute: (amount: number) => Promise<void>;
}

// ── Arena environment styles per mode ──────────────────────────────────────

const ARENA_BG: Record<ArenaMode, string> = {
  waiting:      "radial-gradient(ellipse 70% 50% at 50% 40%,rgba(49,7,70,0.15),transparent 70%)",
  active:       "radial-gradient(ellipse 75% 55% at 50% 42%,rgba(88,28,135,0.24),transparent 70%)",
  steal:        "radial-gradient(ellipse 65% 55% at 50% 45%,rgba(127,29,29,0.35),rgba(4,2,10,0.95) 70%)",
  revive:       "radial-gradient(ellipse 70% 55% at 50% 40%,rgba(20,83,45,0.25),rgba(4,2,10,0.95) 70%)",
  championship: "radial-gradient(ellipse 85% 60% at 50% 42%,rgba(120,53,15,0.3),rgba(88,28,135,0.2),transparent 80%)",
  results:      "radial-gradient(ellipse 70% 55% at 50% 40%,rgba(88,28,135,0.18),transparent 65%)",
};

const ARENA_VIGNETTE: Record<ArenaMode, string> = {
  waiting:      "rgba(4,2,10,0.5)",
  active:       "rgba(4,2,10,0.0)",
  steal:        "rgba(60,0,0,0.4)",
  revive:       "rgba(0,20,5,0.35)",
  championship: "rgba(30,10,0,0.2)",
  results:      "rgba(4,2,10,0.2)",
};

// ── Environmental background particles ─────────────────────────────────────

function AmbientParticles({ mode }: { mode: ArenaMode }) {
  const count = mode === "championship" ? 20 : mode === "active" ? 12 : mode === "waiting" ? 6 : 8;
  const color = mode === "steal" ? "239,68,68" : mode === "revive" ? "34,197,94" : mode === "championship" ? "212,168,83" : "168,85,247";

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = 5 + Math.random() * 90;
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * -8;
        const size = 1 + Math.random() * 2.5;
        return (
          <motion.div
            key={i}
            initial={{ x: `${x}vw`, y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.5, 0.3, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", width: size, height: size * 3, borderRadius: 9999, background: `rgba(${color},0.5)`, filter: "blur(0.5px)" }}
          />
        );
      })}
    </div>
  );
}

// ── Camp banners / environmental dressing ──────────────────────────────────

function EnvironmentDressing({ mode }: { mode: ArenaMode }) {
  if (mode === "waiting" || mode === "results") return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {/* Light beams */}
      {mode === "championship" && Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.05, 0.15, 0.05], rotate: [0, 2, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
          style={{
            position: "absolute",
            top: "-20%",
            left: `${15 + i * 20}%`,
            width: "2px",
            height: "140%",
            background: `linear-gradient(180deg,rgba(212,168,83,0.3) 0%,transparent 60%)`,
            transformOrigin: "top center",
            transform: `rotate(${-15 + i * 10}deg)`,
          }}
        />
      ))}
      {/* Passing shadow drones */}
      {mode === "active" && (
        <motion.div
          animate={{ x: ["-10%", "110%"] }}
          transition={{ duration: 15, repeat: Infinity, delay: 3 }}
          style={{ position: "absolute", top: "8%", width: 40, height: 6, background: "rgba(0,0,0,0.3)", borderRadius: 9999, filter: "blur(4px)" }}
        />
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function GameplayArena({
  phase, round, maxRounds, phaseEndsAt,
  tokens, playerRank, totalPlayers,
  isEliminated, isRevivable,
  isSpinning, spinLocked, lastOutcome,
  squadMembers, leaderboard, currentUserId,
  showStealPicker, stealTargets, stealInProgress,
  attackerId, fireBoostTaps, reviveTargetId,
  totalPoolCents,
  onSpin, onSpinComplete, onTokensAwarded, onStealActivated,
  onStealSelect, onStealCancel, onResolveSteal,
  onFireBoost, onReviveContribute,
}: GameplayArenaProps) {
  const remaining = usePhaseTimer(phaseEndsAt);

  // Derive arena mode from gameplay state
  const arenaMode: ArenaMode = isEliminated
    ? "results"
    : showStealPicker
    ? "steal"
    : reviveTargetId
    ? "revive"
    : stealInProgress
    ? "steal"
    : isSpinning
    ? "active"
    : phase >= 5
    ? "championship"
    : "active";

  const handleSpin = useCallback(() => {
    if (spinLocked || isSpinning || isEliminated) return;
    onSpin();
  }, [spinLocked, isSpinning, isEliminated, onSpin]);

  // Revive target info
  const reviveTarget = reviveTargetId
    ? squadMembers.find(m => m.user_id === reviveTargetId)
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#06030f",
        overflow: "hidden",
        zIndex: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Background radial / mode-reactive ── */}
      <motion.div
        animate={{ background: ARENA_BG[arenaMode] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
      />

      {/* Bottom depth gradient */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "radial-gradient(ellipse 100% 65% at 50% 100%,rgba(60,0,110,0.28),transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none", zIndex: 1 }} />

      {/* Top / bottom fades */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg,rgba(4,2,10,0.8),transparent)", pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(0deg,rgba(4,2,10,0.97),transparent)", pointerEvents: "none", zIndex: 2 }} />

      {/* Vignette edge overlay */}
      <motion.div
        animate={{ background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, ${ARENA_VIGNETTE[arenaMode]} 100%)` }}
        transition={{ duration: 1.5 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
      />

      {/* Ambient particles */}
      <AmbientParticles mode={arenaMode} />

      {/* Environment dressing */}
      <EnvironmentDressing mode={arenaMode} />

      {/* ── Main content ── */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 16px" }}>

        {/* Wheel */}
        <motion.div
          animate={{
            scale: arenaMode === "steal" ? 0.88 : arenaMode === "revive" ? 0.82 : arenaMode === "championship" ? 1.06 : 1,
            filter: arenaMode === "steal" ? "brightness(0.7)" : arenaMode === "revive" ? "brightness(0.6) saturate(0.5)" : "brightness(1)",
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "min(72vw, 320px)", height: "min(72vw, 320px)" }}
        >
          <PremiumSpinWheel
            isSpinning={isSpinning}
            outcome={lastOutcome}
            onSpinComplete={onSpinComplete}
            onTokensAwarded={onTokensAwarded}
            onStealActivated={onStealActivated}
          />
        </motion.div>

        {/* Engage button */}
        <motion.div
          animate={{
            opacity: arenaMode === "revive" || arenaMode === "steal" ? 0.3 : 1,
            scale: arenaMode === "revive" || arenaMode === "steal" ? 0.9 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <ButtonAnimator
            isSpinning={isSpinning || spinLocked}
            disabled={isEliminated || arenaMode === "steal" || arenaMode === "revive"}
            onClick={handleSpin}
          />
        </motion.div>

        {/* Fire boost meter — shown during steal */}
        <AnimatePresence>
          {stealInProgress && attackerId && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{ position: "absolute", right: 20, top: "30%" }}
            >
              <FireBoostMeter
                taps={fireBoostTaps}
                onTap={onFireBoost}
                disabled={!stealInProgress}
              />
              {/* Resolve steal button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onResolveSteal}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 12,
                  border: "1.5px solid rgba(239,68,68,0.6)",
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                EXECUTE
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Overlays ── */}

      {/* Steal target picker */}
      <AnimatePresence>
        {showStealPicker && (
          <StealTargetPicker
            targets={stealTargets}
            onSelect={onStealSelect}
            onCancel={onStealCancel}
          />
        )}
      </AnimatePresence>

      {/* Revive panel */}
      <AnimatePresence>
        {reviveTargetId && reviveTarget && (
          <RevivePanel
            targetUsername={reviveTarget.profiles?.username ?? "Teammate"}
            required={3}
            contributed={0}
            timeRemaining={30}
            onContribute={onReviveContribute}
          />
        )}
      </AnimatePresence>

      {/* Championship ring flare */}
      <AnimatePresence>
        {arenaMode === "championship" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0.06] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 40% at 50% 50%,rgba(212,168,83,0.15) 0%,transparent 70%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
