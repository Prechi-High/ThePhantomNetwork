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

const OUTCOME_LABELS: Record<SpinOutcome, string> = {
  ADVANCE: "+3 TOK",
  ACQUIRE: "+1 TOK",
  DISCOVER: "+0.5 TOK",
  STEAL: "STEAL",
  VOID: "0 TOK",
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
    <div className="relative mx-auto h-[min(72vw,280px)] w-[min(72vw,280px)] sm:h-72 sm:w-72">
      <div className="absolute -inset-3 rounded-full border border-sky-400/20" />
      <div className="absolute -inset-6 rounded-full border border-sky-400/10" />

      <motion.div
        className="relative h-full w-full rounded-full border-4 border-phantom-gold/80 shadow-[0_0_40px_rgba(212,168,83,0.15)]"
        style={{
          background: `conic-gradient(${SEGMENTS.map(
            (s, i) =>
              `${OUTCOME_COLORS[s]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
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
      >
        {SEGMENTS.map((s, i) => {
          const angle = i * segmentAngle + segmentAngle / 2 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 32;
          const y = 50 + Math.sin(rad) * 32;
          return (
            <div
              key={s}
              className="pointer-events-none absolute text-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
              }}
            >
              <span className="block text-[8px] font-bold uppercase leading-tight text-white drop-shadow-md sm:text-[9px]">
                {s}
              </span>
              <span className="block text-[7px] text-white/80 sm:text-[8px]">
                {OUTCOME_LABELS[s]}
              </span>
            </div>
          );
        })}
      </motion.div>

      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
        <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-phantom-gold drop-shadow-lg" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-phantom-gold/60 bg-phantom-bg shadow-inner">
        <span className="font-display text-lg font-bold text-phantom-gold">P</span>
      </div>

      {outcome && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap"
        >
          <span
            className="rounded-lg border border-phantom-border bg-phantom-bg/95 px-4 py-1.5 font-display text-sm font-bold sm:text-base"
            style={{ color: OUTCOME_COLORS[outcome] }}
          >
            {outcome}
          </span>
        </motion.div>
      )}
    </div>
  );
}
