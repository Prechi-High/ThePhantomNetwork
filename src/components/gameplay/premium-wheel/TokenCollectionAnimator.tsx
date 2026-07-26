"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { TOKEN_TIMINGS, OUTCOME_CONFIG, EASING } from "@/config/spinConfig";
import { Z } from "./config";
import { spinAudio } from "./SpinAudioController";

interface TokenCollectionAnimatorProps {
  outcome: SpinOutcome;
  /** Total token delta (e.g. 3, 1, 0.5) */
  tokenAmount: number;
  onComplete: () => void;
  /** Called each time a token particle lands — lets parent increment the counter */
  onTokenArrived?: (amount: number) => void;
  /** ID of the HUD element to fly toward */
  targetElementId?: string;
  /** ID of the element tokens spawn from (outcome card) */
  originElementId?: string;
}

interface TokenParticle {
  id: number;
  delay: number;
  /** Quadratic bezier path as CSS value arrays */
  xFrames: string[];
  yFrames: string[];
  amount: number;
}

/**
 * TokenCollectionAnimator — Token flight choreography
 *
 * After reveal:
 *   Outcome card visible →
 *   Tokens burst outward →
 *   Curve toward HUD counter →
 *   Counter pulses →
 *   Float "+N" label →
 *   Live Feed reacts
 *
 * Uses real viewport query to find the token counter position.
 * Falls back to top-right corner if element not found.
 */
export function TokenCollectionAnimator({
  outcome,
  tokenAmount,
  onComplete,
  onTokenArrived,
  targetElementId = "token-counter",
  originElementId = "outcome-card-anchor",
}: TokenCollectionAnimatorProps) {
  const cfg = OUTCOME_CONFIG[outcome];
  const [particles, setParticles] = useState<TokenParticle[]>([]);
  const landedRef = useRef(0);
  const completeCalledRef = useRef(false);

  // Determine particle count and per-particle value
  const { count, perParticle } = useMemo(() => {
    if (tokenAmount <= 0) return { count: 0, perParticle: 0 };
    if (tokenAmount === 0.5) return { count: 1, perParticle: 0.5 };
    if (tokenAmount === 1) return { count: 1, perParticle: 1 };
    return { count: Math.min(Math.ceil(tokenAmount), 5), perParticle: tokenAmount / Math.min(Math.ceil(tokenAmount), 5) };
  }, [tokenAmount]);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    let targetX = typeof window !== "undefined" ? window.innerWidth * 0.92 : 300;
    let targetY = typeof window !== "undefined" ? window.innerHeight * 0.06 : 40;
    let sx = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let sy = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    if (typeof document !== "undefined") {
      const targetEl = document.getElementById(targetElementId);
      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        targetX = r.left + r.width / 2;
        targetY = r.top + r.height / 2;
      }
      const originEl = document.getElementById(originElementId);
      if (originEl) {
        const r = originEl.getBoundingClientRect();
        sx = r.left + r.width / 2;
        sy = r.top + r.height / 2;
      }
    }
    const steps = 20;

    const generated: TokenParticle[] = Array.from({ length: count }).map((_, i) => {
      // Control point with scatter
      const cx = sx + (targetX - sx) * 0.4 + (Math.random() - 0.5) * 160;
      const cy = sy + (targetY - sy) * 0.6 - 100 + (Math.random() - 0.5) * 100;
      const xFrames: string[] = [];
      const yFrames: string[] = [];

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        xFrames.push(`${(1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t ** 2 * targetX}px`);
        yFrames.push(`${(1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t ** 2 * targetY}px`);
      }

      return {
        id: i,
        delay: i * TOKEN_TIMINGS.TOKEN_INCREMENT_DELAY,
        xFrames,
        yFrames,
        amount: perParticle,
      };
    });

    landedRef.current = 0;
    completeCalledRef.current = false;
    setParticles(generated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, tokenAmount, count]);

  const handleLanded = (amount: number) => {
    spinAudio.playTokenTick();
    onTokenArrived?.(amount);
    landedRef.current += 1;
    if (landedRef.current >= count && !completeCalledRef.current) {
      completeCalledRef.current = true;
      setTimeout(onComplete, 380);
    }
  };

  const valueLabel = tokenAmount === 0.5 ? "+½" : `+${tokenAmount}`;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: Z.TOKEN_FLIGHT }}
    >
      {/* Floating "+N" label that fades up */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 1, 0], y: [0, -60] }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute font-display font-black text-3xl"
        style={{
          left: "50%",
          top: "42vh",
          transform: "translateX(-50%)",
          color: "#fcd34d",
          textShadow: "0 0 20px rgba(234,179,8,0.7)",
        }}
      >
        {valueLabel}
      </motion.div>

      {/* Token particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${typeof window !== "undefined" ? window.innerWidth / 2 : 0}px`,
              y: `${typeof window !== "undefined" ? window.innerHeight / 2 : 0}px`,
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              x: p.xFrames,
              y: p.yFrames,
              scale: [0.7, 1.4, 1.1, 0.5, 0.25],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: TOKEN_TIMINGS.TOKEN_FLY_DURATION / 1000,
              delay: p.delay / 1000,
              ease: EASING.TOKEN_FLIGHT,
            }}
            onAnimationComplete={() => handleLanded(p.amount)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {/* Token coin — gold Phantom style */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-[0.75rem] border-2 border-amber-200/60 shadow-lg"
              style={{
                background: "radial-gradient(circle at 35% 28%, #fff8dc 0%, #fcd34d 35%, #ca8a04 70%, #854d0e 100%)",
                boxShadow: "0 0 24px rgba(234,179,8,0.65), 0 0 8px rgba(0,0,0,0.6)",
                color: "#1a0a00",
              }}
            >
              P
            </div>

            {/* Motion trail glow */}
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-[6px]"
              style={{ background: cfg.glow }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
