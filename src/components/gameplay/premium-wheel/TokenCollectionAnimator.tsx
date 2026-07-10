"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SPIN_TIMINGS, OUTCOME_CONFIG, EASING } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

interface TokenCollectionAnimatorProps {
  outcome: SpinOutcome;
  tokenAmount: number;
  onComplete: () => void;
  targetElementId?: string;
}

interface FlyingToken {
  id: number;
  delay: number;
  curve: { x: number; y: number }[];
}

/**
 * Token Collection Animator
 * Animates tokens flying from the reveal card to the player's token counter
 * with curved bezier motion and sequential counter increments
 */
export function TokenCollectionAnimator({
  outcome,
  tokenAmount,
  onComplete,
  targetElementId = "token-counter",
}: TokenCollectionAnimatorProps) {
  const [tokens, setTokens] = useState<FlyingToken[]>([]);
  const [completed, setCompleted] = useState(0);
  const config = OUTCOME_CONFIG[outcome];

  useEffect(() => {
    // Generate flying tokens
    const tokenCount = Math.ceil(tokenAmount);
    const newTokens: FlyingToken[] = [];

    for (let i = 0; i < tokenCount; i++) {
      // Create curved path (bezier-like)
      const curve = [];
      const steps = 20;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        // Bezier curve calculation
        const x = t * 100 + Math.sin(t * Math.PI) * 30;
        const y = -t * 100 + Math.cos(t * Math.PI * 2) * 20;
        curve.push({ x, y });
      }

      newTokens.push({
        id: i,
        delay: i * SPIN_TIMINGS.TOKEN_INCREMENT_DELAY,
        curve,
      });
    }

    setTokens(newTokens);
  }, [tokenAmount]);

  const handleTokenComplete = () => {
    const newCompleted = completed + 1;
    setCompleted(newCompleted);

    // Play tick sound
    const audio = new Audio('/audio/wheel/token-tick.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Silent fail if audio doesn't load
    });

    if (newCompleted >= tokens.length) {
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  if (tokens.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {tokens.map((token) => (
        <motion.div
          key={token.id}
          initial={{
            x: "50vw",
            y: "50vh",
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: ["50vw", "45vw", "40vw", "35vw", "30vw", "25vw", "20vw", "calc(var(--target-x, 10vw))"],
            y: ["50vh", "45vh", "40vh", "35vh", "30vh", "25vh", "20vh", "calc(var(--target-y, 5vh))"],
            scale: [1, 1.2, 1.1, 1, 0.8, 0.6, 0.4, 0.2],
            opacity: [1, 1, 1, 1, 0.9, 0.7, 0.5, 0],
          }}
          transition={{
            duration: SPIN_TIMINGS.TOKEN_FLY_DURATION / 1000,
            delay: token.delay / 1000,
            ease: EASING.TOKEN_CURVE,
          }}
          onAnimationComplete={handleTokenComplete}
          className="absolute"
        >
          {/* Token Visual */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{
              background: config.primary,
              boxShadow: `0 0 20px ${config.glow}, 0 0 40px ${config.glow}`,
              color: outcome === 'ADVANCE' ? '#000' : '#fff',
            }}
          >
            {tokenAmount === 0.5 ? '½' : '+1'}
          </div>

          {/* Trail Effect */}
          <motion.div
            animate={{
              opacity: [0.6, 0],
              scale: [0.8, 1.5],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: config.glow,
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
