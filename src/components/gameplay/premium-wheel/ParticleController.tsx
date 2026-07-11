"use client";

import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, PARTICLE_CONFIG } from "@/config/spinConfig";

interface ParticleControllerProps {
  outcome: SpinOutcome;
  active: boolean;
}

/**
 * ParticleController Component
 * Manages highly optimized full-screen GPU-friendly particle bursts
 * and ambient thematic emissions for each spin outcome.
 */
export function ParticleController({ outcome, active }: ParticleControllerProps) {
  const config = OUTCOME_CONFIG[outcome];

  if (!active) return null;

  const count = PARTICLE_CONFIG.COUNTS[outcome] || 50;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
      {/* Background Radial Glow Flash */}
      <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.45, 0], scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${config.glow} 0%, transparent 65%)`,
            willChange: "transform, opacity",
          }}
      />

      {/* Explosion Particles */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 + (Math.random() - 0.5) * 15;
        const velocity = Math.random() * 80 + 40; // vw/vh velocity units
        const size = Math.random() * 8 + 3;
        const duration = Math.random() * 1.5 + 0.8;
        const delay = Math.random() * 0.1;

        return (
          <motion.div
            key={`p-${i}`}
            initial={{
              x: '50vw',
              y: '50vh',
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `calc(50vw + ${Math.cos(angle * Math.PI / 180) * velocity}vw)`,
              y: `calc(50vh + ${Math.sin(angle * Math.PI / 180) * velocity}vh)`,
              scale: [0, 1.2, 0.8, 0],
              opacity: [1, 1, 0.6, 0],
            }}
            transition={{
              duration,
              delay,
              ease: [0.1, 0.8, 0.25, 1], // Rapid explode and slow drift
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: config.primary,
              boxShadow: `0 0 ${size * 2}px ${config.glow}`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* Outcome-Specific Cinematic Overlays */}
      {outcome === "ADVANCE" && <GoldenRays />}
      {outcome === "ACQUIRE" && <EmeraldCrystals />}
      {outcome === "DISCOVER" && <BlueSparks />}
      {outcome === "STEAL" && <RedSmoke />}
      {outcome === "VOID" && <GrayDust />}
    </div>
  );
}

// ============================================================================
// OUTCOME PARTICLE MODULES
// ============================================================================

function GoldenRays() {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.7, 0], scaleY: [0, 1.2, 1.2] }}
          transition={{ duration: 2.0, ease: "easeOut", delay: i * 0.04 }}
          className="absolute left-1/2 top-1/2 origin-bottom w-[3px] h-[55vh]"
          style={{
            background: "linear-gradient(180deg, #FFD700 0%, transparent 100%)",
            transform: `rotate(${i * 22.5}deg) translate(-50%, -100%)`,
            filter: "blur(2px)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </>
  );
}

function EmeraldCrystals() {
  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        return (
          <motion.div
            key={`crystal-${i}`}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.1, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.2,
              delay: i * 0.04,
              ease: "easeOut",
            }}
            className="absolute w-3.5 h-3.5 bg-emerald-500"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.8)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
}

function BlueSparks() {
  return (
    <>
      {Array.from({ length: 35 }).map((_, i) => {
        const xDir = (Math.random() - 0.5) * 55;
        const yDir = (Math.random() - 0.5) * 55;
        return (
          <motion.div
            key={`spark-${i}`}
            initial={{ x: "50vw", y: "50vh", scale: 1, opacity: 1 }}
            animate={{
              x: `calc(50vw + ${xDir}vw)`,
              y: `calc(50vh + ${yDir}vh)`,
              scale: [1, 0.4, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.015,
              ease: "easeOut",
            }}
            className="absolute w-2 h-2 rounded-full bg-blue-500"
            style={{
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.9)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
}

function RedSmoke() {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const xSpread = (Math.random() - 0.5) * 45;
        const ySpread = (Math.random() - 0.5) * 45;
        return (
          <motion.div
            key={`smoke-${i}`}
            initial={{ x: "50vw", y: "50vh", scale: 0.4, opacity: 0 }}
            animate={{
              x: `calc(50vw + ${xSpread}vw)`,
              y: `calc(50vh + ${ySpread}vh)`,
              scale: [0.4, 2.2, 3.5],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 2.4,
              delay: i * 0.08,
              ease: "easeOut",
            }}
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, transparent 70%)",
              filter: "blur(18px)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
}

function GrayDust() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => {
        const xOffset = (Math.random() - 0.5) * 35;
        const yFall = Math.random() * 25 + 15;
        return (
          <motion.div
            key={`dust-${i}`}
            initial={{ x: "50vw", y: "50vh", scale: 1, opacity: 0.7 }}
            animate={{
              x: `calc(50vw + ${xOffset}vw)`,
              y: `calc(50vh + ${yFall}vh)`,
              opacity: [0.7, 0.4, 0],
              scale: [1, 0.8, 0.4],
            }}
            transition={{
              duration: 2.8,
              delay: i * 0.03,
              ease: "easeOut",
            }}
            className="absolute w-3 h-3 rounded-full bg-gray-500"
            style={{
              filter: "blur(3px)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
}
