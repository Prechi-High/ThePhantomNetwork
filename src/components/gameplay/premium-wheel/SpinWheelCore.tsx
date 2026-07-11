"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import type { SpinOutcome } from "@/types/gameplay";
import { WHEEL_CONFIG, OUTCOME_CONFIG, SPIN_TIMINGS, EASING } from "@/config/spinConfig";

interface SpinWheelCoreProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

/**
 * Premium 5-Segment Spin Wheel
 * Clean, cinematic design with exactly 72° per segment
 * No repeated icons or labels - each segment is unique and prominent
 */
export function SpinWheelCore({ isSpinning, outcome, onSpinComplete }: SpinWheelCoreProps) {
  const controls = useAnimation();
  const currentRotationRef = useRef(0);

  useEffect(() => {
    if (!isSpinning || !outcome) return;

    const targetIndex = WHEEL_CONFIG.SEGMENT_ORDER.indexOf(outcome);
    if (targetIndex === -1) return;

    // Calculate final rotation
    const targetAngle = targetIndex * WHEEL_CONFIG.SEGMENT_ANGLE;
    const spins = WHEEL_CONFIG.BASE_ROTATIONS * 360;
    const finalRotation = spins + (360 - targetAngle); // Needle is at top, pointing down

    // Multi-phase animation
    controls.start({
      rotate: finalRotation,
      transition: {
        duration: SPIN_TIMINGS.SPIN_DURATION / 1000,
        ease: EASING.SPIN_EASE,
      },
    }).then(() => {
      currentRotationRef.current = finalRotation;
      onSpinComplete();
    });
  }, [isSpinning, outcome, controls, onSpinComplete]);

  return (
    <div className="relative w-full h-full">
      {/* Outer Glow Rings */}
      <motion.div
        animate={{
          opacity: isSpinning ? [0.3, 0.6, 0.3] : 0.2,
          scale: isSpinning ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isSpinning ? Infinity : 0,
        }}
        className="absolute -inset-4 rounded-full border-2 border-phantom-gold/20"
      />

      <motion.div
        animate={{
          opacity: isSpinning ? [0.2, 0.4, 0.2] : 0.1,
          scale: isSpinning ? [1, 1.08, 1] : 1,
        }}
        transition={{
          duration: 2.5,
          repeat: isSpinning ? Infinity : 0,
          delay: 0.3,
        }}
        className="absolute -inset-8 rounded-full border border-phantom-gold/10"
      />

      {/* Main Wheel Container */}
      <motion.div
        animate={controls}
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          boxShadow: '0 0 60px rgba(212, 168, 83, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Wheel Segments */}
        {WHEEL_CONFIG.SEGMENT_ORDER.map((segment, index) => {
          const config = OUTCOME_CONFIG[segment];
          const startAngle = index * WHEEL_CONFIG.SEGMENT_ANGLE;
          const endAngle = (index + 1) * WHEEL_CONFIG.SEGMENT_ANGLE;

          return (
            <div
              key={segment}
              className="absolute inset-0"
              style={{
                clipPath: `polygon(50% 50%, ${getArcPath(startAngle, endAngle)})`,
                background: `linear-gradient(135deg, ${config.primary} 0%, ${config.accent} 100%)`,
              }}
            >
              {/* Segment Content */}
              <div
                className="absolute w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotate(${startAngle + WHEEL_CONFIG.SEGMENT_ANGLE / 2}deg)`,
                }}
              >
                <div
                  className="flex flex-col items-center gap-2"
                  style={{
                    transform: `translateY(-35%) rotate(-${startAngle + WHEEL_CONFIG.SEGMENT_ANGLE / 2}deg)`,
                  }}
                >
                  {/* Icon */}
                  <span className="text-4xl drop-shadow-lg">{config.icon}</span>
                  
                  {/* Label */}
                  <span className="font-display text-lg font-bold uppercase tracking-wider text-white drop-shadow-md">
                    {segment}
                  </span>
                </div>
              </div>

              {/* Segment Divider */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `rotate(${endAngle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-black/30" />
              </div>
            </div>
          );
        })}

        {/* Center Hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{
              scale: isSpinning ? [1, 1.1, 1] : 1,
              boxShadow: isSpinning
                ? [
                    '0 0 30px rgba(212, 168, 83, 0.5)',
                    '0 0 50px rgba(212, 168, 83, 0.8)',
                    '0 0 30px rgba(212, 168, 83, 0.5)',
                  ]
                : '0 0 30px rgba(212, 168, 83, 0.5)',
            }}
            transition={{
              duration: 1,
              repeat: isSpinning ? Infinity : 0,
            }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '4px solid rgba(0, 0, 0, 0.3)',
            }}
          >
            <span className="font-display text-3xl font-bold text-black drop-shadow-md">
              P
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Needle/Pointer at Top */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20" style={{ marginTop: '-2px' }}>
        <motion.div
          animate={{
            y: isSpinning ? [0, -4, 0] : 0,
          }}
          transition={{
            duration: 0.3,
            repeat: isSpinning ? Infinity : 0,
          }}
          className="relative"
        >
          {/* Needle Shadow */}
          <div
            className="absolute inset-0 blur-sm"
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '24px solid rgba(0, 0, 0, 0.3)',
            }}
          />
          {/* Needle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '24px solid #FFD700',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Generate arc path for segment clip-path
 */
function getArcPath(startAngle: number, endAngle: number): string {
  const radius = 50; // Percentage
  const points: string[] = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    const rad = (angle - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);
    points.push(`${x}% ${y}%`);
  }

  return points.join(', ');
}
