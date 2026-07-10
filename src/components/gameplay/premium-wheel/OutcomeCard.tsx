"use client";

import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG, EASING } from "@/config/spinConfig";

interface OutcomeCardProps {
  outcome: SpinOutcome;
  visible: boolean;
}

/**
 * Cinematic Outcome Reveal Card
 * Displays the spin result with dramatic entrance animation,
 * themed lighting, particles, and sound effects
 */
export function OutcomeCard({ outcome, visible }: OutcomeCardProps) {
  const config = OUTCOME_CONFIG[outcome];

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.5,
        ease: EASING.REVEAL_ENTRANCE,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Environment Lighting Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${config.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Outcome Card */}
      <motion.div
        initial={{ rotateY: -90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
        style={{ perspective: 1000 }}
      >
        <div
          className="relative rounded-2xl border-4 p-8 backdrop-blur-xl shadow-2xl min-w-[320px]"
          style={{
            borderColor: config.primary,
            background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)`,
            boxShadow: `0 0 60px ${config.glow}, 0 0 120px ${config.glow}`,
          }}
        >
          {/* Animated Border Glow */}
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(45deg, ${config.primary}, ${config.accent}, ${config.primary})`,
              backgroundSize: '200% 200%',
              opacity: 0.3,
              filter: 'blur(20px)',
            }}
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-4"
          >
            <span className="text-7xl drop-shadow-2xl">{config.icon}</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="font-display text-4xl font-bold text-center mb-2 tracking-wider"
            style={{ color: config.primary, textShadow: `0 0 20px ${config.glow}` }}
          >
            {config.cardTitle}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center text-sm uppercase tracking-widest"
            style={{ color: config.accent }}
          >
            {config.cardSubtitle}
          </motion.p>

          {/* Particle Effects Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  scale: Math.random() * 2 + 1,
                  opacity: 0,
                }}
                transition={{
                  duration: Math.random() * 1.5 + 1,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: config.primary,
                  boxShadow: `0 0 10px ${config.glow}`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
