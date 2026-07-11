"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SPIN_TIMINGS, OUTCOME_CONFIG, EASING } from "@/config/spinConfig";
import { spinAudio } from "./SpinAudioController";

interface TokenCollectionAnimatorProps {
  outcome: SpinOutcome;
  tokenAmount: number;
  onComplete: () => void;
  onTokenArrived?: (amount: number) => void;
  targetElementId?: string;
}

interface FlyingToken {
  id: number;
  delay: number;
  keyframesX: string[];
  keyframesY: string[];
  amount: number;
}

/**
 * TokenCollectionAnimator Component
 * Animates tokens flying from the center of the reveal card to the player's token counter.
 * Features:
 * - Real-time viewport query for the actual position of the token counter element.
 * - Dynamic Bezier curve keyframe generation with random offsets to create a "scatter spray" effect.
 * - Progressive sequential timing so tokens fly one after another.
 * - Custom event emitters for arrival tick sound and counter incrementing.
 */
export function TokenCollectionAnimator({
  outcome,
  tokenAmount,
  onComplete,
  onTokenArrived,
  targetElementId = "token-counter",
}: TokenCollectionAnimatorProps) {
  const [tokens, setTokens] = useState<FlyingToken[]>([]);
  const [arrivedCount, setArrivedCount] = useState(0);
  const config = OUTCOME_CONFIG[outcome];

  useEffect(() => {
    // 1. Locate target element or use fallback coordinates
    let targetX = window.innerWidth * 0.9;
    let targetY = window.innerHeight * 0.05;

    const counterElement = document.getElementById(targetElementId);
    if (counterElement) {
      const rect = counterElement.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    // 2. Determine number of token particles to spawn
    let particleCount = 1;
    let amountPerParticle = tokenAmount;

    if (tokenAmount === 3) {
      particleCount = 3;
      amountPerParticle = 1;
    }

    // 3. Generate bezier curves for each particle
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    const generated: FlyingToken[] = [];

    for (let i = 0; i < particleCount; i++) {
      const keyframesX: string[] = [];
      const keyframesY: string[] = [];
      const steps = 18;

      // Add random variation to control point to create scatter arc
      const controlX = startX + (targetX - startX) * 0.35 + (Math.random() - 0.5) * 180;
      const controlY = startY + (targetY - startY) * 0.65 - 120 + (Math.random() - 0.5) * 120;

      // Compute quadratic bezier curve coordinates
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * targetX;
        const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * targetY;
        keyframesX.push(`${x}px`);
        keyframesY.push(`${y}px`);
      }

      generated.push({
        id: i,
        delay: i * SPIN_TIMINGS.TOKEN_INCREMENT_DELAY,
        keyframesX,
        keyframesY,
        amount: amountPerParticle,
      });
    }

    setTokens(generated);
  }, [tokenAmount, targetElementId]);

  const handleArrival = (amount: number) => {
    // Play tick sound on impact
    spinAudio.playTokenTick();

    // Trigger visual increment in page state
    if (onTokenArrived) {
      onTokenArrived(amount);
    }

    setArrivedCount((prev) => {
      const next = prev + 1;
      if (next >= tokens.length) {
        // All tokens have landed, delay completion slightly for visual resolve
        setTimeout(() => {
          onComplete();
        }, 350);
      }
      return next;
    });
  };

  if (tokens.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      <AnimatePresence>
        {tokens.map((token) => (
          <motion.div
            key={token.id}
            initial={{
              x: `${window.innerWidth / 2}px`,
              y: `${window.innerHeight / 2}px`,
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              x: token.keyframesX,
              y: token.keyframesY,
              scale: [0.8, 1.3, 1.1, 0.7, 0.4],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: SPIN_TIMINGS.TOKEN_FLY_DURATION / 1000,
              delay: token.delay / 1000,
              ease: EASING.TOKEN_FLIGHT,
            }}
            onAnimationComplete={() => handleArrival(token.amount)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {/* Inner Metallic Token Core */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-sm border-2 border-white/60 shadow-lg"
              style={{
                background: `radial-gradient(circle, ${config.primary} 30%, ${config.accent} 100%)`,
                boxShadow: `0 0 25px ${config.glow}, 0 0 10px rgba(0,0,0,0.5)`,
                color: outcome === "ADVANCE" ? "#1e0b36" : "#ffffff",
              }}
            >
              {tokenAmount === 0.5 ? "½" : "+1"}
            </div>

            {/* Glowing Motion Blur Trail */}
            <motion.div
              animate={{
                scale: [1, 1.4],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 0.35,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full blur-[6px]"
              style={{
                background: config.glow,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
