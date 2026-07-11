"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SPIN_TIMINGS, OUTCOME_CONFIG } from "@/config/spinConfig";
import { spinAudio } from "./SpinAudioController";

interface RevealSequenceProps {
  outcome: SpinOutcome;
  active: boolean;
  onCardShow: () => void;
  onAnimateStart: () => void;
}

/**
 * RevealSequence Component
 * Handles the cinematic multi-phase reveal timeline:
 * - 0.0s: Cut audio, darken screen, pause.
 * - 0.3s: Form energy orb at center (outcome-colored).
 * - 0.8s: Expand orb into a large light burst (plays reveal sound).
 * - 1.1s: Screen flash (white flash + screen shake).
 * - 1.3s: Explode outcome card into view.
 * - 1.5s: Start animations & particle streams.
 */
export function RevealSequence({ outcome, active, onCardShow, onAnimateStart }: RevealSequenceProps) {
  const config = OUTCOME_CONFIG[outcome];
  const [phase, setPhase] = useState<"idle" | "pause" | "energy" | "burst" | "flash" | "explode">("idle");

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    // 0.0s: Start pause state
    setPhase("pause");
    spinAudio.playRevealBurst(); // Preload/play early reveal sound

    // 0.3s: Energy orb begins forming
    const energyTimer = setTimeout(() => {
      setPhase("energy");
    }, SPIN_TIMINGS.REVEAL_ENERGY_START);

    // 0.8s: Orb expands into burst
    const burstTimer = setTimeout(() => {
      setPhase("burst");
    }, SPIN_TIMINGS.REVEAL_BURST_START);

    // 1.1s: Screen flash + screen shake
    const flashTimer = setTimeout(() => {
      setPhase("flash");
      applyCameraShake(outcome);
    }, SPIN_TIMINGS.REVEAL_FLASH_START);

    // 1.3s: Card explodes
    const cardTimer = setTimeout(() => {
      setPhase("explode");
      onCardShow();
    }, SPIN_TIMINGS.REVEAL_CARD_EXPLODE);

    // 1.5s: Particles & animations start
    const animTimer = setTimeout(() => {
      onAnimateStart();
    }, SPIN_TIMINGS.REVEAL_ANIM_START);

    return () => {
      clearTimeout(energyTimer);
      clearTimeout(burstTimer);
      clearTimeout(flashTimer);
      clearTimeout(cardTimer);
      clearTimeout(animTimer);
    };
  }, [active, outcome, onCardShow, onAnimateStart]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* Full screen ambient dimming overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== "idle" ? 0.65 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-black"
      />

      {/* Full screen thematic ambient lighting colored by outcome */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: ["flash", "explode"].includes(phase) ? 0.35 : 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 transition-colors duration-500"
            style={{
              background: `radial-gradient(circle at center, ${config.glow} 0%, transparent 80%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 1: Center Energy Orb */}
      {phase === "energy" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 2.2],
              opacity: [0, 0.9, 1],
            }}
            transition={{
              duration: (SPIN_TIMINGS.REVEAL_BURST_START - SPIN_TIMINGS.REVEAL_ENERGY_START) / 1000,
              ease: "easeIn",
            }}
            className="w-12 h-12 rounded-full blur-[4px]"
            style={{
              background: `radial-gradient(circle, #ffffff 0%, ${config.primary} 60%, transparent 100%)`,
              boxShadow: `0 0 40px ${config.primary}, 0 0 80px ${config.glow}`,
            }}
          />
        </div>
      )}

      {/* Phase 2: Large expanding light burst */}
      {phase === "burst" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{
              scale: 35,
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: (SPIN_TIMINGS.REVEAL_FLASH_START - SPIN_TIMINGS.REVEAL_BURST_START) / 1000,
              ease: "easeOut",
            }}
            className="w-16 h-16 rounded-full blur-[10px]"
            style={{
              background: `radial-gradient(circle, #ffffff 0%, ${config.primary} 50%, transparent 100%)`,
              boxShadow: `0 0 60px ${config.primary}, 0 0 120px ${config.glow}`,
            }}
          />
        </div>
      )}

      {/* Phase 3: Screen flash overlay */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Camera Shake Effect
 * Shakes the DOM root to simulate heavy visual impact.
 */
function applyCameraShake(outcome: SpinOutcome): void {
  const config = OUTCOME_CONFIG[outcome];
  if (config.cameraShake === "none") return;

  const intensity = {
    subtle: 3,
    medium: 7,
    strong: 15,
  }[config.cameraShake] || 0;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    
    // Quick heavy vibration sequence
    root.style.transition = "none";
    root.style.transform = `translate(${intensity}px, ${intensity}px) rotate(0.5deg)`;
    
    setTimeout(() => {
      root.style.transform = `translate(-${intensity * 0.8}px, -${intensity * 0.8}px) rotate(-0.5deg)`;
    }, 45);

    setTimeout(() => {
      root.style.transform = `translate(${intensity * 0.5}px, -${intensity * 0.5}px) rotate(0.2deg)`;
    }, 90);

    setTimeout(() => {
      root.style.transform = `translate(-${intensity * 0.2}px, ${intensity * 0.2}px) rotate(0deg)`;
    }, 135);

    setTimeout(() => {
      root.style.transform = "translate(0, 0)";
      root.style.transition = "";
    }, 180);
  }
}
