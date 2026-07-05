"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SPIN_DURATION_MS } from "@/types/gameplay";
import { Zap, Shield, UserMinus, Umbrella, Crown, Plus } from "lucide-react";

const WHEEL_SECTORS = [
  { id: "STEAL", name: "STEAL", color: "#7c3aed", icon: <UserMinus className="w-6 h-6" />, centerAngle: 0 },
  { id: "MULTIPLIER", name: "2x", color: "#6d28d9", textColor: "text-purple-400", centerAngle: 45 },
  { id: "SHIELD", name: "SHIELD", color: "#1e40af", icon: <Shield className="w-6 h-6" />, centerAngle: 90 },
  { id: "REVIVE", name: "REVIVE", color: "#166534", icon: <Plus className="w-6 h-6" />, centerAngle: 135 },
  { id: "CLOAK", name: "CLOAK", color: "#581c87", icon: <UserMinus className="w-6 h-6" />, centerAngle: 180 },
  { id: "INSURANCE", name: "INSURANCE", color: "#854d0e", icon: <Umbrella className="w-6 h-6" />, centerAngle: 225 },
  { id: "JACKPOT", name: "JACKPOT", color: "#a16207", icon: <Crown className="w-6 h-6" />, centerAngle: 270 },
  { id: "ADVANCE", name: "ADVANCE", color: "#92400e", icon: <Zap className="w-6 h-6" />, centerAngle: 315 },
];

const getTargetAngle = (id: string): number => {
  const sector = WHEEL_SECTORS.find((s) => s.id === id);
  if (!sector) return 0;
  return (360 - sector.centerAngle) % 360;
};

interface PremiumWheelProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

export function PremiumWheel({ isSpinning, outcome, onSpinComplete }: PremiumWheelProps) {
  const controls = useAnimation();
  const finalRotationRef = useRef(0);

  useEffect(() => {
    if (isSpinning && outcome !== null) {
      let normalizedCurrent = finalRotationRef.current % 360;
      if (normalizedCurrent < 0) normalizedCurrent += 360;

      const targetAngle = getTargetAngle(outcome);
      const fullRotations = 5;
      let additionalRotation = targetAngle - normalizedCurrent;
      if (additionalRotation <= 0) additionalRotation += 360;

      const finalRotation = finalRotationRef.current + fullRotations * 360 + additionalRotation;

      controls.start({
        rotate: finalRotation,
        transition: {
          duration: SPIN_DURATION_MS / 1000,
          ease: [0.25, 0.1, 0.25, 1],
        },
      });

      finalRotationRef.current = finalRotation;
    }
  }, [isSpinning, outcome, controls]);

  const handleAnimationComplete = () => {
    if (isSpinning) onSpinComplete();
  };

  return (
    <div className="relative mx-auto">
      {/* Outer Glow Ring */}
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-600/50 via-transparent to-purple-600/50 blur-3xl opacity-70" />

      <div className="relative h-[min(70vw,300px)] w-[min(70vw,300px)] sm:h-[340px] sm:w-[340px]">
        {/* Static Outer Frame */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.5)]" />

        {/* Rotating Wheel */}
        <motion.div
          className="absolute inset-2 rounded-full overflow-hidden border-2 border-purple-700/70"
          animate={controls}
          onAnimationComplete={handleAnimationComplete}
          style={{
            background: `conic-gradient(${WHEEL_SECTORS.map((s, i) => `${s.color} ${i * 45}deg ${(i + 1) * 45}deg`).join(",")})`,
          }}
        >
          {/* Center Emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-purple-800 to-purple-950 border-4 border-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.7)]">
              <span className="font-display text-5xl sm:text-6xl font-black text-purple-400 drop-shadow-lg">P</span>
            </div>
          </div>
        </motion.div>

        {/* Top Pointer */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3 z-10">
          <div className="w-8 h-12 relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-purple-400 to-purple-600 rotate-45 shadow-[0_0_20px_rgba(139,92,246,0.8)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[16px] border-r-[16px] border-b-[24px] border-l-transparent border-r-transparent border-b-purple-500 drop-shadow-lg" />
          </div>
        </div>

        {/* Sector Labels (Static on Frame) */}
        {WHEEL_SECTORS.map((sector, index) => {
          const angle = sector.centerAngle;

          return (
            <div
              key={sector.id}
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div
                className="absolute left-1/2 top-2 -translate-x-1/2 -translate-y-[150px] flex flex-col items-center"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                {sector.icon && (
                  <div className={`${sector.textColor || "text-white"} mb-1`}>{sector.icon}</div>
                )}
                <span className="text-sm font-black drop-shadow-lg text-white">{sector.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outcome Display */}
      {outcome && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-16 left-1/2 z-50 -translate-x-1/2"
        >
          <span className="glass rounded-xl border-2 border-purple-500 px-6 py-3 font-display text-2xl font-black text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            {outcome}
          </span>
        </motion.div>
      )}
    </div>
  );
}
