"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, FEATURE_FLAGS } from "@/config/spinConfig";
import { Z } from "./config";

interface OutcomeCelebrationProps {
  outcome: SpinOutcome;
  visible: boolean;
}

/**
 * OutcomeCelebration — Full-screen outcome-specific flourishes
 * Renders after token collection completes as a final emotional beat.
 *
 * ADVANCE  → golden rays + upward streak
 * ACQUIRE  → coin orbit burst
 * DISCOVER → blue expanding rings + pulse
 * STEAL    → crimson slash + screen distortion
 * VOID     → black implosion + echo fade (dignified, not defeated)
 */
export const OutcomeCelebration = memo(function OutcomeCelebration({
  outcome,
  visible,
}: OutcomeCelebrationProps) {
  if (!visible || !FEATURE_FLAGS.OUTCOME_CELEBRATIONS) return null;

  const cfg = OUTCOME_CONFIG[outcome];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: Z.PARTICLES - 2 }}
    >
      {/* Ambient flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${cfg.glow} 0%, transparent 65%)`,
        }}
      />

      {/* Shared radial burst */}
      <RadialBurst cfg={cfg} count={60} />

      {/* Outcome-specific layer */}
      {outcome === "ADVANCE"  && <AdvanceCelebration primary={cfg.primary} />}
      {outcome === "ACQUIRE"  && <AcquireCelebration primary={cfg.primary} glow={cfg.glow} />}
      {outcome === "DISCOVER" && <DiscoverCelebration primary={cfg.primary} />}
      {outcome === "STEAL"    && <StealCelebration />}
      {outcome === "VOID"     && <VoidCelebration />}
    </div>
  );
});

// ---- Shared burst ----

const RadialBurst = memo(function RadialBurst({
  cfg,
  count,
}: {
  cfg: typeof OUTCOME_CONFIG[SpinOutcome];
  count: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = 40 + Math.random() * 55;
        const size = 4 + Math.random() * 7;
        const dur = 1 + Math.random() * 1.5;
        const rad = angle * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
            animate={{
              x: `calc(50vw + ${Math.cos(rad) * dist}vw)`,
              y: `calc(50vh + ${Math.sin(rad) * dist}vh)`,
              scale: [0, 1, 0.8, 0],
              opacity: [1, 1, 0.5, 0],
            }}
            transition={{ duration: dur, delay: Math.random() * 0.25, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: cfg.primary,
              boxShadow: `0 0 ${size * 2}px ${cfg.glow}`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </>
  );
});

// ---- ADVANCE: golden rays + upward streaks ----

const AdvanceCelebration = memo(function AdvanceCelebration({ primary }: { primary: string }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.7, 0], scaleY: [0, 1, 1] }}
          transition={{ duration: 1.8, delay: i * 0.06 }}
          className="absolute left-1/2 top-1/2 origin-bottom w-[3px] h-[48vh]"
          style={{
            background: `linear-gradient(180deg, ${primary} 0%, transparent 100%)`,
            transform: `rotate(${i * 30}deg) translate(-50%, -100%)`,
            filter: "blur(2px)",
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`streak-${i}`}
          initial={{ x: `${10 + i * 10}vw`, y: "110vh", opacity: 0.8 }}
          animate={{ y: "-10vh", opacity: [0.8, 0.5, 0] }}
          transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }}
          className="absolute w-[1.5px] h-[18vh]"
          style={{ background: `linear-gradient(180deg, ${primary} 0%, transparent 100%)` }}
        />
      ))}
    </>
  );
});

// ---- ACQUIRE: orbiting coin burst ----

const AcquireCelebration = memo(function AcquireCelebration({
  primary,
  glow,
}: {
  primary: string;
  glow: string;
}) {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const orbit = 15 + Math.random() * 30;
        const angle = (i / 18) * 360;
        const rad = angle * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            initial={{
              x: "50vw",
              y: "50vh",
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `calc(50vw + ${Math.cos(rad) * orbit}vw)`,
              y: `calc(50vh + ${Math.sin(rad) * orbit}vh)`,
              scale: [0, 1.2, 1, 0],
              opacity: [1, 1, 0.6, 0],
            }}
            transition={{ duration: 1.8, delay: i * 0.05, ease: "easeOut" }}
            className="absolute w-5 h-5 rounded-full flex items-center justify-center font-black text-[0.55rem]"
            style={{
              background: `radial-gradient(circle, #fff 20%, ${primary} 100%)`,
              boxShadow: `0 0 10px ${glow}`,
              color: "#1e0b36",
            }}
          >
            ¢
          </motion.div>
        );
      })}
    </>
  );
});

// ---- DISCOVER: expanding pulse rings ----

const DiscoverCelebration = memo(function DiscoverCelebration({ primary }: { primary: string }) {
  return (
    <>
      {[0, 0.3, 0.6, 0.9].map((delay, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.1, opacity: 0.7 }}
          animate={{ scale: [0.1, 2.5], opacity: [0.7, 0] }}
          transition={{ duration: 2, delay, ease: "easeOut", repeat: 1 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: "30vw",
            height: "30vw",
            borderColor: `${primary}66`,
          }}
        />
      ))}
    </>
  );
});

// ---- STEAL: crimson slash + brief screen tint ----

const StealCelebration = memo(function StealCelebration() {
  return (
    <>
      <motion.div
        initial={{ scaleX: 0, opacity: 0.9 }}
        animate={{ scaleX: [0, 1.5, 0], opacity: [0.9, 0.9, 0] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute top-1/2 left-0 w-full h-[3px] origin-left"
        style={{ background: "linear-gradient(90deg, transparent, #ef4444, transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.15, 0] }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
        style={{ background: "rgba(239,68,68,0.12)" }}
      />
    </>
  );
});

// ---- VOID: black implosion + echo fade ----

const VoidCelebration = memo(function VoidCelebration() {
  return (
    <>
      <motion.div
        initial={{ scale: 1.5, opacity: 0.4 }}
        animate={{ scale: [1.5, 0.3], opacity: [0.4, 0] }}
        transition={{ duration: 1.2, ease: "easeIn" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)",
        }}
      />
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: [0.5, 0], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, delay, ease: "easeIn" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-600/40"
          style={{ width: "25vw", height: "25vw" }}
        />
      ))}
    </>
  );
});
