"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, PARTICLE_CONFIG, FEATURE_FLAGS } from "@/config/spinConfig";
import { Z } from "./config";

interface ParticleControllerProps {
  outcome: SpinOutcome;
  active: boolean;
  /** Override particle count (respects quality profile) */
  countOverride?: number;
}

/**
 * ParticleController — Event-driven GPU-optimised particle bursts
 *
 * Orchestrates:
 *   - Radial explosion burst (outcome-coloured)
 *   - Outcome-specific cinematic overlays
 *   - willChange + transform3d for GPU compositing
 */
export const ParticleController = memo(function ParticleController({
  outcome,
  active,
  countOverride,
}: ParticleControllerProps) {
  if (!active || !FEATURE_FLAGS.OUTCOME_CELEBRATIONS) return null;

  const cfg = OUTCOME_CONFIG[outcome];
  const count = countOverride ?? (PARTICLE_CONFIG.COUNTS[outcome] || 50);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: Z.PARTICLES }}
    >
      {/* Background radial glow flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.7, 1.25, 1] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${cfg.glow} 0%, transparent 65%)`,
          willChange: "transform, opacity",
        }}
      />

      {/* Explosion burst */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 + (Math.random() - 0.5) * 18;
        const velocity = PARTICLE_CONFIG.VELOCITY_SPREAD * (3 + Math.random() * 7);
        const size =
          PARTICLE_CONFIG.SIZE_MIN +
          Math.random() * (PARTICLE_CONFIG.SIZE_MAX - PARTICLE_CONFIG.SIZE_MIN);
        const duration = 0.8 + Math.random() * 1.2;
        const delay = Math.random() * 0.08;
        const rad = angle * (Math.PI / 180);
        const dx = Math.cos(rad) * velocity;
        const dy = Math.sin(rad) * velocity - PARTICLE_CONFIG.GRAVITY * velocity;

        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
            animate={{
              x: `calc(50vw + ${dx}vw)`,
              y: `calc(50vh + ${dy}vh)`,
              scale: [0, 1.3, 0.9, 0],
              opacity: [1, 1, 0.6, 0],
            }}
            transition={{ duration, delay, ease: [0.1, 0.8, 0.25, 1] }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: cfg.primary,
              boxShadow: `0 0 ${size * 2}px ${cfg.glow}`,
              willChange: "transform, opacity",
              transform: "translate3d(0,0,0)",
            }}
          />
        );
      })}

      {/* Outcome-specific cinematic overlays */}
      {outcome === "ADVANCE" && <GoldenRays primary={cfg.primary} />}
      {outcome === "ACQUIRE" && <EmeraldCrystals />}
      {outcome === "DISCOVER" && <BlueSparks />}
      {outcome === "STEAL" && <RedSmoke />}
      {outcome === "VOID" && <GrayDust />}
    </div>
  );
});

// ---- Outcome modules ----

const GoldenRays = memo(function GoldenRays({ primary }: { primary: string }) {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.75, 0], scaleY: [0, 1.2, 1.2] }}
          transition={{ duration: 2, ease: "easeOut", delay: i * 0.04 }}
          className="absolute left-1/2 top-1/2 origin-bottom w-[3px] h-[52vh]"
          style={{
            background: `linear-gradient(180deg, ${primary} 0%, transparent 100%)`,
            transform: `rotate(${i * 22.5}deg) translate(-50%, -100%)`,
            filter: "blur(2px)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </>
  );
});

const EmeraldCrystals = memo(function EmeraldCrystals() {
  return (
    <>
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1, 0], rotate: [0, 180, 360], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, delay: i * 0.04, ease: "easeOut" }}
            className="absolute w-3 h-3 bg-emerald-500"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              boxShadow: "0 0 14px rgba(16,185,129,0.8)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
});

const BlueSparks = memo(function BlueSparks() {
  return (
    <>
      {Array.from({ length: 35 }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 55;
        const dy = (Math.random() - 0.5) * 55;
        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 1, opacity: 1 }}
            animate={{
              x: `calc(50vw + ${dx}vw)`,
              y: `calc(50vh + ${dy}vh)`,
              scale: [1, 0.4, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{ duration: 1.8, delay: i * 0.015, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-blue-500"
            style={{ boxShadow: "0 0 12px rgba(59,130,246,0.9)", willChange: "transform, opacity" }}
          />
        );
      })}
    </>
  );
});

const RedSmoke = memo(function RedSmoke() {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 45;
        const dy = (Math.random() - 0.5) * 45;
        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 0.4, opacity: 0 }}
            animate={{
              x: `calc(50vw + ${dx}vw)`,
              y: `calc(50vh + ${dy}vh)`,
              scale: [0.4, 2.2, 3.5],
              opacity: [0, 0.7, 0],
            }}
            transition={{ duration: 2.4, delay: i * 0.08, ease: "easeOut" }}
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)",
              filter: "blur(18px)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
});

const GrayDust = memo(function GrayDust() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 35;
        const dy = Math.random() * 25 + 12;
        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 1, opacity: 0.7 }}
            animate={{
              x: `calc(50vw + ${dx}vw)`,
              y: `calc(50vh + ${dy}vh)`,
              scale: [1, 0.8, 0.4],
              opacity: [0.7, 0.4, 0],
            }}
            transition={{ duration: 2.8, delay: i * 0.03, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full bg-gray-500"
            style={{ filter: "blur(3px)", willChange: "transform, opacity" }}
          />
        );
      })}
    </>
  );
});
