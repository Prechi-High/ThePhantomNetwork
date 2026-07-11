"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { WHEEL_CONFIG, OUTCOME_CONFIG, SPIN_TIMINGS, EASING } from "@/config/spinConfig";
import { spinAudio } from "./SpinAudioController";

interface SpinAnimatorProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

/**
 * SpinAnimator Component
 * Renders the 5-segment premium visual wheel and coordinates the rotation timeline.
 * Handles:
 * - 0.0s - 0.3s powerful spin impulse
 * - 0.3s - 4.8s high-speed spin
 * - 4.8s - 5.6s progressive slowdown
 * - 5.6s - 6.0s precise stop & bounce lock
 */
export function SpinAnimator({ isSpinning, outcome, onSpinComplete }: SpinAnimatorProps) {
  const wheelControls = useAnimation();
  const pointerControls = useAnimation();
  const currentRotationRef = useRef(0);

  useEffect(() => {
    if (!isSpinning || !outcome) return;

    const targetIndex = WHEEL_CONFIG.SEGMENT_ORDER.indexOf(outcome);
    if (targetIndex === -1) return;

    // Calculate rotation angle to align target sector center with pointer at top (0°)
    const targetAngle = targetIndex * WHEEL_CONFIG.SEGMENT_ANGLE;
    const spins = WHEEL_CONFIG.BASE_ROTATIONS * 360;
    
    // finalRotation = full spins + rotation to match the target segment at 0° (top)
    const finalRotation = spins + (360 - targetAngle);

    // Audio: Play launch & loop
    spinAudio.playSpinStart();

    // Trigger tick sounds at intervals matching rotation speed (simulated clicking)
    let tickInterval: NodeJS.Timeout;
    const startTime = Date.now();
    
    const triggerTicks = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= SPIN_TIMINGS.SPIN_DURATION) return;

      // Click frequency starts fast, slows down during deceleration
      let delay = 80; // Fast rotation ticks
      if (elapsed > SPIN_TIMINGS.SLOWDOWN_START) {
        const slowElapsed = elapsed - SPIN_TIMINGS.SLOWDOWN_START;
        delay = 80 + (slowElapsed / 800) * 450; // Slowly decaying click rate
      }

      spinAudio.playTokenTick();
      tickInterval = setTimeout(triggerTicks, delay);
    };
    
    // Start ticking shortly after start
    setTimeout(triggerTicks, 100);

    // Timeline-based animation using Framer Motion
    wheelControls.start({
      rotate: finalRotation,
      transition: {
        duration: SPIN_TIMINGS.SPIN_DURATION / 1000,
        ease: EASING.SPIN_EASE,
      },
    }).then(() => {
      // Clear ticks
      clearTimeout(tickInterval);
      
      // Stop loop audio and play lock sound
      spinAudio.playSpinStop();

      // Pointer lock-click bounce
      pointerControls.start({
        rotate: [0, -15, 8, -3, 0],
        transition: { duration: 0.45, ease: "easeOut" },
      });

      currentRotationRef.current = finalRotation % 360;
      onSpinComplete();
    });

    // Pointer tick-wiggle during spin
    pointerControls.start({
      rotate: [0, -8, 8, -8, 8, -8, 8, -4, 4, 0],
      transition: {
        duration: SPIN_TIMINGS.SPIN_DURATION / 1000,
        ease: "easeInOut",
      },
    });

    // Slowdown sound cue
    setTimeout(() => {
      spinAudio.playSpinSlowdown();
    }, SPIN_TIMINGS.SLOWDOWN_START);

    return () => {
      clearTimeout(tickInterval);
    };
  }, [isSpinning, outcome, wheelControls, pointerControls, onSpinComplete]);

  return (
    <div className="relative w-full h-full">
      {/* Cinematic Outer Frame & Shadow */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-purple-500/20"
        style={{
          boxShadow: "0 0 50px rgba(0,0,0,0.8), 0 0 30px rgba(139, 92, 246, 0.15)",
        }}
      />

      {/* Rotating Wheel canvas */}
      <motion.div
        animate={wheelControls}
        initial={{ rotate: currentRotationRef.current }}
        className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-purple-900/60"
        style={{
          background: "#080415",
          boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.9)",
          willChange: "transform",
        }}
      >
        {/* Render 5 Clean Segments */}
        {WHEEL_CONFIG.SEGMENT_ORDER.map((segment, index) => {
          const config = OUTCOME_CONFIG[segment];
          // Offset start and end by -36 degrees so ADVANCE is centered at 0° (top)
          const startAngle = index * WHEEL_CONFIG.SEGMENT_ANGLE - 36;
          const endAngle = (index + 1) * WHEEL_CONFIG.SEGMENT_ANGLE - 36;
          const centerAngle = index * WHEEL_CONFIG.SEGMENT_ANGLE;

          return (
            <div
              key={segment}
              className="absolute inset-0"
              style={{
                clipPath: `polygon(50% 50%, ${getArcPath(startAngle, endAngle)})`,
              }}
            >
              {/* Slice Background: Deep metallic gradient themed by outcome */}
              <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 15%, ${config.primary}1A 0%, rgba(8, 4, 21, 0.95) 75%)`,
                  border: `1px solid ${config.primary}12`,
                }}
              />

              {/* Segment Content */}
              <div
                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${centerAngle}deg)`,
                }}
              >
                <div
                  className="flex flex-col items-center gap-2"
                  style={{
                    transform: `translateY(-33%) rotate(-${centerAngle}deg)`,
                  }}
                >
                  {/* Large Icon */}
                  <span className="text-[2.6rem] drop-shadow-[0_0_12px_rgba(0,0,0,0.5)] select-none">
                    {config.icon}
                  </span>
                  
                  {/* Large Label */}
                  <span 
                    className="font-display text-[0.8rem] font-black uppercase tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ color: config.primary }}
                  >
                    {segment}
                  </span>
                </div>
              </div>

              {/* Sector Border/Divider Lines */}
              <div
                className="absolute inset-0 origin-center pointer-events-none"
                style={{
                  transform: `rotate(${endAngle}deg)`,
                }}
              >
                <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-b from-purple-500/20 via-purple-900/10 to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Outer Ring Overlay inside wheel */}
        <div className="absolute inset-0 rounded-full border border-purple-500/10 pointer-events-none" />

        {/* Center Hub: visually dominant */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-purple-800 bg-gradient-to-br from-purple-950 to-black"
            style={{
              boxShadow: "0 0 25px rgba(0,0,0,0.8), inset 0 0 15px rgba(139, 92, 246, 0.4)",
            }}
          >
            <span className="font-display text-4xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              P
            </span>
          </div>
        </div>
      </motion.div>

      {/* Needle / Pointer at top */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 -translate-y-2 pointer-events-none">
        <motion.div
          animate={pointerControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "50% 20%" }}
          className="relative filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
        >
          {/* Needle Arrowhead pointing down */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "32px solid #FFD700",
            }}
          />
          {/* Small metallic pin holding needle */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-purple-950 border border-purple-600 shadow-inner" />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Generate arc path coordinates for segment clip-path polygon
 */
function getArcPath(startAngle: number, endAngle: number): string {
  const radius = 50; // percentage
  const points: string[] = [];
  const steps = 15;

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    const rad = (angle - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);
    points.push(`${x}% ${y}%`);
  }

  return points.join(", ");
}
