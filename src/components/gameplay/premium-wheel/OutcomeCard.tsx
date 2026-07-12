"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, EASING, OUTCOME_CATEGORIES } from "@/config/spinConfig";

interface OutcomeCardProps {
  outcome: SpinOutcome;
  visible: boolean;
  tokenAmount?: number;
}

// Token values per outcome (server should send these; these are display defaults)
const OUTCOME_TOKEN_DISPLAY: Record<SpinOutcome, string> = {
  ADVANCE: "+3 TOKENS",
  ACQUIRE: "+1 TOKEN",
  DISCOVER: "+½ TOKEN",
  STEAL: "STEAL",
  VOID: "VOID",
};

const OUTCOME_SUBTITLE: Record<SpinOutcome, string> = {
  ADVANCE: "Momentum Increased",
  ACQUIRE: "Resources Secured",
  DISCOVER: "Hidden Opportunity",
  STEAL: "Choose Your Target",
  VOID: "No Opportunity Found",
};

/**
 * OutcomeCard — Themed cinematic result card
 *
 * Each outcome has:
 *   - Unique primary colour, glow, and particle identity
 *   - ADVANCE: emerald energy + forward streak
 *   - ACQUIRE: gold burst + orbiting coins
 *   - DISCOVER: blue pulse + expanding rings
 *   - STEAL: crimson slash + distortion ripple
 *   - VOID: black implosion + fading light
 */
export function OutcomeCard({ outcome, visible, tokenAmount }: OutcomeCardProps) {
  const cfg = OUTCOME_CONFIG[outcome];
  const category = OUTCOME_CATEGORIES[outcome];
  const valueLabel = tokenAmount != null
    ? (tokenAmount > 0 ? `+${tokenAmount} TOKEN${tokenAmount !== 1 ? "S" : ""}` : "VOID")
    : OUTCOME_TOKEN_DISPLAY[outcome];

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 55 }}>
          {/* 3-D container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotateX: 55, y: 120 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -60, transition: { duration: 0.3 } }}
            transition={{ duration: 0.65, ease: EASING.CARD_EXPLOSION }}
            style={{ perspective: 1400 }}
            className="relative"
          >
            {/* Ambient backlight */}
            <div
              className="absolute -inset-8 rounded-[40px] blur-[50px]"
              style={{
                background: `radial-gradient(circle, ${cfg.glow} 20%, transparent 70%)`,
                opacity: 0.9,
              }}
            />

            {/* Card body */}
            <div
              className="relative rounded-3xl p-9 backdrop-blur-md flex flex-col items-center min-w-[320px] max-w-[380px]"
              style={{
                border: `1.5px solid ${cfg.primary}`,
                background: "linear-gradient(150deg, rgba(14,8,30,0.97) 0%, rgba(5,3,12,0.99) 100%)",
                boxShadow: `0 0 50px ${cfg.glow}, inset 0 0 30px rgba(255,255,255,0.02)`,
              }}
            >
              {/* Animated border glow */}
              <motion.div
                animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 1.015, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: `1.5px solid ${cfg.accent}`, filter: "blur(6px)" }}
              />

              {/* Category pill */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="px-4 py-1 rounded-full border text-[0.65rem] font-bold tracking-[0.28em] uppercase mb-4"
                style={{
                  borderColor: `${cfg.primary}55`,
                  color: cfg.primary,
                  background: `${cfg.primary}14`,
                  boxShadow: `0 0 12px ${cfg.glow}`,
                }}
              >
                {category.toUpperCase()}
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 80, delay: 0.2 }}
                className="mb-4"
                style={{ filter: `drop-shadow(0 0 16px ${cfg.primary})` }}
              >
                <span className="text-[5.5rem] leading-none">{cfg.icon}</span>
              </motion.div>

              {/* Value */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="font-display text-[2.6rem] font-black text-center leading-none mb-2 tracking-wide"
                style={{
                  color: "#ffffff",
                  textShadow: `0 0 30px ${cfg.glow}, 0 2px 6px rgba(0,0,0,0.9)`,
                }}
              >
                {valueLabel}
              </motion.h2>

              {/* Outcome name badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="font-display text-[1.1rem] font-black tracking-[0.2em] mb-2"
                style={{ color: cfg.primary, textShadow: `0 0 14px ${cfg.glow}` }}
              >
                {outcome}
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
                style={{ color: cfg.accent }}
              >
                {OUTCOME_SUBTITLE[outcome]}
              </motion.p>

              {/* Outcome-specific inner effects */}
              <OutcomeInnerEffect outcome={outcome} cfg={cfg} />

              {/* Ambient embers inside card */}
              <CardEmbers primary={cfg.primary} glow={cfg.glow} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---- Per-outcome inner card effect ----

interface EffectProps {
  outcome: SpinOutcome;
  cfg: typeof OUTCOME_CONFIG[SpinOutcome];
}

function OutcomeInnerEffect({ outcome, cfg }: EffectProps) {
  if (outcome === "ADVANCE") {
    // Forward motion streaks
    return (
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%", opacity: 0.6 }}
            animate={{ x: "200%", opacity: [0.6, 0.8, 0] }}
            transition={{ duration: 0.8, delay: i * 0.12, repeat: Infinity, repeatDelay: 1.5 }}
            className="absolute h-[1px]"
            style={{
              top: `${20 + i * 12}%`,
              left: 0,
              width: "60%",
              background: `linear-gradient(90deg, transparent, ${cfg.primary}, transparent)`,
            }}
          />
        ))}
      </div>
    );
  }
  if (outcome === "ACQUIRE") {
    // Orbiting token rings
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {[40, 65, 90].map((r, i) => (
          <motion.div
            key={i}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 rounded-full border"
            style={{
              width: `${r}%`,
              height: `${r}%`,
              marginLeft: `-${r / 2}%`,
              marginTop: `-${r / 2}%`,
              borderColor: `${cfg.primary}22`,
            }}
          />
        ))}
      </div>
    );
  }
  if (outcome === "DISCOVER") {
    // Expanding rings
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl flex items-center justify-center">
        {[0, 0.4, 0.8].map((delay, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: [0.3, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full border"
            style={{
              width: "80%",
              height: "80%",
              borderColor: `${cfg.primary}55`,
            }}
          />
        ))}
      </div>
    );
  }
  if (outcome === "STEAL") {
    // Crimson slash lines
    return (
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <motion.div
          initial={{ scaleX: 0, opacity: 0.9 }}
          animate={{ scaleX: [0, 1.2, 0], opacity: [0.9, 0.9, 0] }}
          transition={{ duration: 0.35, delay: 0.1, repeat: Infinity, repeatDelay: 2 }}
          className="absolute top-1/2 left-0 w-full h-[2px] origin-left"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.primary}, transparent)` }}
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0.7 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0.7, 0.7, 0] }}
          transition={{ duration: 0.3, delay: 0.25, repeat: Infinity, repeatDelay: 2 }}
          className="absolute"
          style={{
            top: "45%",
            left: 0,
            width: "100%",
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
            transformOrigin: "right center",
          }}
        />
      </div>
    );
  }
  if (outcome === "VOID") {
    // Light fading inward
    return (
      <motion.div
        animate={{ opacity: [0, 0.5, 0], scale: [1.2, 0.8, 1.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, transparent 65%)",
        }}
      />
    );
  }
  return null;
}

// ---- Ambient embers ----

interface EmberProps { primary: string; glow: string; }

function CardEmbers({ primary, glow }: EmberProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {Array.from({ length: 12 }).map((_, i) => {
        const xStart = 10 + Math.random() * 80;
        return (
          <motion.div
            key={i}
            initial={{ x: `${xStart}%`, y: "110%", opacity: 0.8, scale: Math.random() * 0.6 + 0.3 }}
            animate={{
              y: "-10%",
              x: `${xStart + (Math.random() - 0.5) * 12}%`,
              opacity: [0.8, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 1.4 + 1,
              delay: Math.random() * 0.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute w-[5px] h-[5px] rounded-full"
            style={{ background: primary, boxShadow: `0 0 8px ${glow}` }}
          />
        );
      })}
    </div>
  );
}
