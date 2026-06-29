"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SPIN_DURATION_MS } from "@/types/gameplay";
import { WHEEL_SECTORS, getTargetAngle } from "./config";

interface PremiumWheelProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

export function PremiumWheel({ isSpinning, outcome, onSpinComplete }: PremiumWheelProps) {
  const controls = useAnimation();
  const finalRotationRef = useRef(0);

  const targetIndex = outcome ? WHEEL_SECTORS.findIndex((s) => s.id === outcome) : 0;

  useEffect(() => {
    if (isSpinning && outcome !== null) {
      const fullRotations = 5;
      const targetAngle = getTargetAngle(targetIndex, WHEEL_SECTORS);
      const finalRotation = finalRotationRef.current + fullRotations * 360 + targetAngle;
      
      controls.start({
        rotate: finalRotation,
        transition: {
          duration: SPIN_DURATION_MS / 1000,
          ease: [0.25, 0.1, 0.25, 1],
        },
      });
      
      finalRotationRef.current = finalRotation;
    }
  }, [isSpinning, outcome, targetIndex, controls]);

  const handleAnimationComplete = () => {
    if (isSpinning) {
      onSpinComplete();
    }
  };

  return (
    <div className="relative mx-auto h-[min(90vw,360px)] w-[min(90vw,360px)] sm:h-[360px] sm:w-[360px]">
      {/* Background Shadow & Lighting */}
      <div className="absolute -inset-6 rounded-full border border-amber-500/10 bg-gradient-radial from-amber-900/20 to-transparent" />
      
      {/* Static Outer Frame */}
      <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
        <div className="h-[120%] w-[120%] rounded-full" style={{
          backgroundImage: `url(/wheel-frame.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }} />
      </div>
      
      {/* Rotating Sector Disc */}
      <motion.div
        className="absolute inset-4 z-20"
        animate={controls}
        onAnimationComplete={handleAnimationComplete}
        style={{
          backgroundImage: `url(/wheel-disc.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Static Center Emblem */}
      <div className="absolute inset-0 z-40 flex items-center justify-center">
        <div className="h-20 w-20 sm:h-24 sm:w-24" style={{
          backgroundImage: `url(/center-emblem.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }} />
      </div>
      
      {/* Top Pointer (fixed to frame) */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-2">
        <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-500 drop-shadow-xl" />
      </div>

      {/* Outcome Display */}
      {outcome && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-12 left-1/2 z-60 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="rounded-lg border border-phantom-border bg-phantom-bg/95 px-5 py-2 font-display text-base font-bold sm:text-lg text-phantom-gold">
            {outcome}
          </span>
        </motion.div>
      )}
    </div>
  );
}
