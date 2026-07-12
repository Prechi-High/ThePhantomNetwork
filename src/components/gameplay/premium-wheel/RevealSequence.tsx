"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { REVEAL_TIMINGS, OUTCOME_CONFIG, CAMERA_FX } from "@/config/spinConfig";
import { spinAudio } from "./SpinAudioController";

type RevealPhase = "idle" | "silence" | "energy" | "burst" | "flash" | "card";

interface RevealSequenceProps {
  outcome: SpinOutcome;
  active: boolean;
  onCardShow: () => void;
  onAnimateStart: () => void;
}

/**
 * RevealSequence — Cinematic multi-phase reveal timeline
 *
 * 0.0s  Silence — 300ms tension pause, background darkens
 * 0.3s  Energy — outcome-coloured orb forms at wheel centre
 * 0.8s  Burst  — orb expands into full-screen light wave
 * 1.1s  Flash  — white screen flash + camera shake
 * 1.3s  Card   — outcome card explodes into view → onCardShow()
 * 1.5s  Anim   — particles + HUD react → onAnimateStart()
 */
export function RevealSequence({ outcome, active, onCardShow, onAnimateStart }: RevealSequenceProps) {
  const cfg = OUTCOME_CONFIG[outcome];
  const [phase, setPhase] = useState<RevealPhase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      clearTimers();
      return;
    }

    // t=0 — silence, play pre-reveal stinger
    setPhase("silence");
    spinAudio.playRevealBurst();

    schedule(() => setPhase("energy"),  REVEAL_TIMINGS.ENERGY_FORMATION_START);
    schedule(() => setPhase("burst"),   REVEAL_TIMINGS.LIGHT_BURST_START);
    schedule(() => {
      setPhase("flash");
      applyCameraShake(cfg.cameraShake);
    }, REVEAL_TIMINGS.SCREEN_FLASH_START);
    schedule(() => {
      setPhase("card");
      onCardShow();
    }, REVEAL_TIMINGS.CARD_ENTRY_START);
    schedule(() => onAnimateStart(), REVEAL_TIMINGS.PARTICLES_START);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, outcome]);

  if (!active) return null;

  const energyDuration =
    (REVEAL_TIMINGS.LIGHT_BURST_START - REVEAL_TIMINGS.ENERGY_FORMATION_START) / 1000;
  const burstDuration =
    (REVEAL_TIMINGS.SCREEN_FLASH_START - REVEAL_TIMINGS.LIGHT_BURST_START) / 1000;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 50 }}>

      {/* Ambient darkening */}
      <motion.div
        animate={{ opacity: phase !== "idle" ? 0.7 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-black"
      />

      {/* Thematic ambient colour wash */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="ambient"
            initial={{ opacity: 0 }}
            animate={{ opacity: ["flash", "card"].includes(phase) ? 0.4 : 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${cfg.glow} 0%, transparent 75%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase: energy orb */}
      <AnimatePresence>
        {phase === "energy" && (
          <motion.div
            key="orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 2.6], opacity: [0, 1, 0.9] }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: energyDuration, ease: "easeIn" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, ${cfg.primary} 55%, transparent 100%)`,
              boxShadow: `0 0 50px ${cfg.primary}, 0 0 100px ${cfg.glow}`,
              filter: "blur(3px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase: light burst wave */}
      <AnimatePresence>
        {phase === "burst" && (
          <motion.div
            key="burst"
            initial={{ scale: 0.6, opacity: 1 }}
            animate={{ scale: 40, opacity: [1, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: burstDuration, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, ${cfg.primary} 45%, transparent 100%)`,
              boxShadow: `0 0 80px ${cfg.primary}`,
              filter: "blur(8px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Outcome-specific burst overlay */}
      <AnimatePresence>
        {(phase === "burst" || phase === "flash") && outcome === "ADVANCE" && (
          <motion.div
            key="advance-burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(255,215,0,0.35) 0%, transparent 65%)",
            }}
          />
        )}
        {(phase === "burst" || phase === "flash") && outcome === "STEAL" && (
          <motion.div
            key="steal-distort"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.6, 0], scale: [1, 1.02, 0.98, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(239,68,68,0.4) 0%, transparent 70%)",
            }}
          />
        )}
        {(phase === "burst" || phase === "flash") && outcome === "VOID" && (
          <motion.div
            key="void-implosion"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: [0.5, 0, 0], scale: [1, 0.6, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, transparent 60%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, CAMERA_FX.FLASH_PEAK_OPACITY, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: CAMERA_FX.FLASH_FADE_DURATION / 1000, ease: "easeInOut" }}
            className="absolute inset-0 bg-white"
            style={{ zIndex: 55 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Camera shake ----

function applyCameraShake(level: "none" | "subtle" | "medium" | "strong"): void {
  if (level === "none" || typeof document === "undefined") return;
  const intensity = CAMERA_FX.SHAKE_INTENSITY[level as keyof Omit<typeof CAMERA_FX.SHAKE_INTENSITY, "none">];
  if (!intensity) return;

  const root = document.documentElement;
  const frames = [
    `translate(${intensity}px, ${intensity * 0.6}px) rotate(0.4deg)`,
    `translate(-${intensity * 0.8}px, -${intensity * 0.5}px) rotate(-0.3deg)`,
    `translate(${intensity * 0.5}px, -${intensity * 0.3}px) rotate(0.15deg)`,
    `translate(-${intensity * 0.2}px, ${intensity * 0.2}px) rotate(0deg)`,
    "translate(0, 0)",
  ];

  root.style.transition = "none";
  frames.forEach((frame, i) => {
    setTimeout(() => {
      root.style.transform = frame;
      if (i === frames.length - 1) root.style.transition = "";
    }, i * 45);
  });
}
