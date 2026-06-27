"use client";

import { motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SPIN_DURATION_MS } from "@/types/gameplay";

const OUTCOME_COLORS: Record<SpinOutcome, string> = {
  ADVANCE: "#d4a853",
  ACQUIRE: "#4ade80",
  DISCOVER: "#60a5fa",
  STEAL: "#e74c3c",
  VOID: "#6b6b80",
};

interface SpinWheelProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

const SEGMENTS: SpinOutcome[] = ["ADVANCE", "ACQUIRE", "DISCOVER", "STEAL", "VOID"];

export function SpinWheel({ isSpinning, outcome, onSpinComplete }: SpinWheelProps) {
  const segmentAngle = 360 / SEGMENTS.length;
  const targetIndex = outcome ? SEGMENTS.indexOf(outcome) : 0;
  const rotation = isSpinning ? 360 * 5 + targetIndex * segmentAngle : 0;

  return (
    <div className="relative mx-auto h-64 w-64">
      <motion.div
        className="h-full w-full rounded-full border-4 border-phantom-gold"
        style={{
          background: `conic-gradient(${SEGMENTS.map(
            (s, i) => `${OUTCOME_COLORS[s]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
          ).join(", ")})`,
        }}
        animate={{ rotate: rotation }}
        transition={{
          duration: isSpinning ? SPIN_DURATION_MS / 1000 : 0,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onAnimationComplete={() => {
          if (isSpinning) onSpinComplete();
        }}
      />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1">
        <div className="h-0 w-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-phantom-gold" />
      </div>
      {outcome && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="rounded-lg bg-phantom-bg/90 px-4 py-2 font-display text-xl font-bold"
            style={{ color: OUTCOME_COLORS[outcome] }}
          >
            {outcome}
          </span>
        </motion.div>
      )}
    </div>
  );
}
