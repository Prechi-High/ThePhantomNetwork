"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import type { SpinOutcome } from "@/types/gameplay";
import { OUTCOME_CONFIG } from "@/config/spinConfig";

interface OutcomeCelebrationProps {
  outcome: SpinOutcome;
  visible: boolean;
}

/**
 * Outcome Celebration - Full Screen Particle Effects
 * Creates immersive celebration animations based on outcome type
 */
export function OutcomeCelebration({ outcome, visible }: OutcomeCelebrationProps) {
  const config = OUTCOME_CONFIG[outcome];

  if (!visible) return null;

  // Generate particles based on outcome type
  const particleCount = outcome === 'ADVANCE' ? 100 : outcome === 'VOID' ? 20 : 50;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {/* Background Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${config.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Particle System */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360;
        const distance = Math.random() * 100 + 50;
        const size = Math.random() * 8 + 4;
        const duration = Math.random() * 2 + 1;
        const delay = Math.random() * 0.3;

        return (
          <motion.div
            key={i}
            initial={{
              x: '50vw',
              y: '50vh',
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `calc(50vw + ${Math.cos(angle * Math.PI / 180) * distance}vw)`,
              y: `calc(50vh + ${Math.sin(angle * Math.PI / 180) * distance}vh)`,
              scale: [0, 1, 0.8, 0],
              opacity: [1, 1, 0.5, 0],
            }}
            transition={{
              duration,
              delay,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: config.primary,
              boxShadow: `0 0 ${size * 2}px ${config.glow}`,
            }}
          />
        );
      })}

      {/* Outcome-Specific Effects */}
      {outcome === 'ADVANCE' && <GoldenRays />}
      {outcome === 'ACQUIRE' && <EmeraldCrystals />}
      {outcome === 'DISCOVER' && <BlueSparks />}
      {outcome === 'STEAL' && <RedSmoke />}
      {outcome === 'VOID' && <GrayDust />}
    </div>
  );
}

// Outcome-specific effect components
function GoldenRays() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.6, 0], scaleY: [0, 1, 1] }}
          transition={{ duration: 1.5, delay: i * 0.05 }}
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: '4px',
            height: '50vh',
            background: 'linear-gradient(180deg, #FFD700 0%, transparent 100%)',
            transform: `rotate(${i * 30}deg)`,
            filter: 'blur(2px)',
          }}
        />
      ))}
    </>
  );
}

function EmeraldCrystals() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.05,
              ease: "easeOut",
            }}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: '12px',
              height: '12px',
              background: '#10B981',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
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
      {Array.from({ length: 30 }).map((_, i) => {
        const x = 50 + (Math.random() - 0.5) * 60;
        const y = 50 + (Math.random() - 0.5) * 60;
        return (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '50vh', scale: 1, opacity: 1 }}
            animate={{
              x: `${x}vw`,
              y: `${y}vh`,
              scale: [1, 0.5, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.02,
              ease: "easeOut",
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: '#3B82F6',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
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
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 50 + (Math.random() - 0.5) * 40;
        const y = 50 + (Math.random() - 0.5) * 40;
        return (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '50vh', scale: 0.5, opacity: 0 }}
            animate={{
              x: `${x}vw`,
              y: `${y}vh`,
              scale: [0.5, 2, 3],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut",
            }}
            className="absolute w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
              filter: 'blur(15px)',
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
      {Array.from({ length: 40 }).map((_, i) => {
        const x = 50 + (Math.random() - 0.5) * 30;
        const y = 50 + Math.random() * 20;
        return (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '50vh', opacity: 0.6 }}
            animate={{
              x: `${x}vw`,
              y: `${y + 30}vh`,
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.02,
              ease: "easeOut",
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: '#6B7280',
              filter: 'blur(4px)',
            }}
          />
        );
      })}
    </>
  );
}
