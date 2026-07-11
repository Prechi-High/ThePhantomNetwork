"use client";

import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, EASING } from "@/config/spinConfig";

interface OutcomeCardProps {
  outcome: SpinOutcome;
  visible: boolean;
}

/**
 * OutcomeCard Component
 * Displays the outcome result in a cinematic 3D floating reward card.
 * Features:
 * - 3D card flip & explode entrance animation
 * - Animated glowing borders and drop-shadows matched to outcome theme
 * - Clear 3-tier typography (Category, Big Value, Narrative Subtitle)
 * - Internal ambient ember particle emitter
 */
export function OutcomeCard({ outcome, visible }: OutcomeCardProps) {
  const config = OUTCOME_CONFIG[outcome];

  if (!visible) return null;

  // Get distinct labels based on the specification
  const getCardDetails = (out: SpinOutcome) => {
    switch (out) {
      case "ADVANCE":
        return { value: "+3 TOKENS", label: "ADVANCE", sub: "Momentum Increased" };
      case "ACQUIRE":
        return { value: "+1 TOKEN", label: "ACQUIRE", sub: "Resources Secured" };
      case "DISCOVER":
        return { value: "+0.5 TOKEN", label: "DISCOVER", sub: "Hidden Opportunity" };
      case "STEAL":
        return { value: "STEAL READY", label: "STEAL", sub: "Choose Your Target" };
      case "VOID":
        return { value: "VOID", label: "VOID", sub: "Nothing Found" };
      default:
        return { value: "", label: "", sub: "" };
    }
  };

  const details = getCardDetails(outcome);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none">
      {/* 3D Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.35, rotateX: 60, y: 100 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -50 }}
        transition={{
          duration: 0.6,
          ease: EASING.CARD_EXPLOSION,
        }}
        className="relative"
        style={{ perspective: 1200 }}
      >
        {/* Neon Ambient Backlight */}
        <div 
          className="absolute -inset-6 rounded-3xl blur-[40px] opacity-80"
          style={{
            background: `radial-gradient(circle, ${config.glow} 20%, transparent 75%)`,
            willChange: "transform, opacity",
          }}
        />

        {/* Card Body */}
        <div
          className="relative rounded-2xl border-2 p-10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-w-[340px] max-w-[400px]"
          style={{
            borderColor: config.primary,
            background: "linear-gradient(135deg, rgba(12, 8, 28, 0.95) 0%, rgba(5, 3, 14, 0.98) 100%)",
            boxShadow: `0 0 45px ${config.glow}, inset 0 0 25px rgba(255,255,255,0.03)`,
          }}
        >
          {/* Neon Border Glow Animation */}
          <motion.div
            animate={{
              opacity: [0.3, 0.75, 0.3],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: `2px solid ${config.accent}`,
              filter: "blur(8px)",
              willChange: "transform, opacity",
            }}
          />

          {/* 1. Category Pill (Top) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="px-4 py-1.5 rounded-full border text-[0.7rem] font-bold tracking-[0.25em] uppercase mb-5"
            style={{
              borderColor: `${config.primary}50`,
              color: config.primary,
              background: `${config.primary}12`,
              boxShadow: `0 0 10px ${config.glow}`,
            }}
          >
            {details.label}
          </motion.div>

          {/* Icon (Floating) */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 90, delay: 0.25 }}
            className="mb-5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
          >
            <span className="text-7xl">{config.icon}</span>
          </motion.div>

          {/* 2. Large Value/Title */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="font-display text-4.5xl font-black text-center mb-3 tracking-wider"
            style={{
              color: "#ffffff",
              textShadow: `0 0 25px ${config.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
            }}
          >
            {details.value}
          </motion.h2>

          {/* 3. Narrative Subtitle (Bottom) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="text-center text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: config.accent }}
          >
            {details.sub}
          </motion.p>

          {/* Ambient ember particle flare inside card boundary */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 15 }).map((_, i) => {
              const xStart = Math.random() * 80 + 10;
              const delay = Math.random() * 0.8;
              const duration = Math.random() * 1.5 + 1.2;

              return (
                <motion.div
                  key={`ember-${i}`}
                  initial={{
                    x: `${xStart}%`,
                    y: "110%",
                    scale: Math.random() * 0.8 + 0.4,
                    opacity: 0.9,
                  }}
                  animate={{
                    y: "-10%",
                    x: `${xStart + (Math.random() - 0.5) * 15}%`,
                    opacity: [0.9, 0.4, 0],
                  }}
                  transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: config.primary,
                    boxShadow: `0 0 8px ${config.glow}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
