"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { WHEEL_CONFIG, OUTCOME_CONFIG, SPIN_TIMINGS, EASING } from "@/config/spinConfig";
import { getTargetRotation, getTickInterval, Z, WHEEL_VISUAL } from "./config";
import { spinAudio } from "./SpinAudioController";

interface SpinAnimatorProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

/**
 * SpinAnimator
 *
 * Owns spin physics and timing only — no gameplay logic.
 *
 * Visual layers (bottom → top):
 *   1. Ambient shadow well
 *   2. Outer illuminated ring with conic gradient
 *   3. Rotating wheel body (5 metallic segments)
 *   4. Glass protective layer (fake glare)
 *   5. Animated energy ring
 *   6. Center hub with breathing pulse
 *   7. Dynamic reflection shimmer
 *   8. Premium needle/pointer
 */
export function SpinAnimator({ isSpinning, outcome, onSpinComplete }: SpinAnimatorProps) {
  const wheelControls = useAnimation();
  const pointerControls = useAnimation();
  const energyControls = useAnimation();
  const currentRotationRef = useRef(0);
  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Idle breathing ----
  useEffect(() => {
    if (isSpinning) return;
    energyControls.start({
      rotate: 360,
      transition: { duration: WHEEL_VISUAL.ENERGY_RING_PERIOD / 1000, repeat: Infinity, ease: "linear" },
    });
  }, [isSpinning, energyControls]);

  // ---- Spin sequence ----
  useEffect(() => {
    if (!isSpinning || !outcome) return;

    const finalRotation = getTargetRotation(outcome);
    const spinDuration = SPIN_TIMINGS.SPIN_DURATION;
    const startTime = Date.now();

    // Audio
    spinAudio.playSpinStart();

    // Pointer wiggle during spin
    pointerControls.start({
      rotate: [0, -10, 10, -10, 10, -8, 8, -5, 5, 0],
      transition: { duration: spinDuration / 1000, ease: "easeInOut" },
    });

    // Pointer tick loop
    const scheduleTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= spinDuration) return;
      spinAudio.playPointerTick();
      const delay = getTickInterval(elapsed, spinDuration);
      tickTimerRef.current = setTimeout(scheduleTick, delay);
    };
    tickTimerRef.current = setTimeout(scheduleTick, 100);

    // Brake audio cue
    const brakeTimer = setTimeout(
      () => spinAudio.playSpinSlowdown(),
      SPIN_TIMINGS.SLOWDOWN_START,
    );

    // Main rotation
    wheelControls
      .start({
        rotate: currentRotationRef.current + finalRotation,
        transition: {
          duration: spinDuration / 1000,
          ease: EASING.SPIN_EASE,
        },
      })
      .then(() => {
        if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
        spinAudio.playSpinStop();

        // Pointer lock-click bounce
        pointerControls.start({
          rotate: [0, -18, 9, -4, 1, 0],
          transition: { duration: 0.5, ease: "easeOut" },
        });

        currentRotationRef.current = (currentRotationRef.current + finalRotation) % 360;
        onSpinComplete();
      });

    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
      clearTimeout(brakeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, outcome]);

  return (
    <div className="relative w-full h-full select-none">

      {/* ---- Layer 1: Ambient shadow well ---- */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(139,92,246,0.08)",
          zIndex: Z.AMBIENT_GLOW,
        }}
      />

      {/* ---- Layer 2: Outer illuminated ring ---- */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-6px",
          background:
            "conic-gradient(from 0deg, rgba(139,92,246,0.6), rgba(212,168,83,0.4), rgba(139,92,246,0.2), rgba(212,168,83,0.5), rgba(139,92,246,0.6))",
          zIndex: Z.OUTER_RING,
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "#09051a",
          zIndex: Z.OUTER_RING,
          margin: "2px",
          borderRadius: "50%",
        }}
      />

      {/* ---- Layer 3: Rotating wheel body ---- */}
      <motion.div
        animate={wheelControls}
        initial={{ rotate: currentRotationRef.current }}
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "#080415",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.95)",
          willChange: "transform",
          zIndex: Z.WHEEL_BODY,
        }}
      >
        {/* Segments */}
        {WHEEL_CONFIG.SEGMENT_ORDER.map((segment, index) => {
          const cfg = OUTCOME_CONFIG[segment];
          const startAngle = index * WHEEL_CONFIG.SEGMENT_ANGLE - 36;
          const endAngle = (index + 1) * WHEEL_CONFIG.SEGMENT_ANGLE - 36;
          const centerAngle = index * WHEEL_CONFIG.SEGMENT_ANGLE;

          return (
            <div
              key={segment}
              className="absolute inset-0"
              style={{ clipPath: `polygon(50% 50%, ${buildArcPath(startAngle, endAngle)})` }}
            >
              {/* Metallic segment base */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 15%, ${cfg.primary}22 0%, rgba(6,3,15,0.97) 70%)`,
                }}
              />
              {/* Subtle inner highlight edge */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${centerAngle}deg, ${cfg.primary}08 0%, transparent 50%)`,
                }}
              />

              {/* Segment label + icon */}
              <div
                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${centerAngle}deg)` }}
              >
                <div
                  className="flex flex-col items-center gap-[5px]"
                  style={{ transform: `translateY(-34%) rotate(-${centerAngle}deg)` }}
                >
                  <span
                    className="text-[2.4rem] drop-shadow-[0_0_14px_rgba(0,0,0,0.7)] select-none"
                    style={{ filter: `drop-shadow(0 0 8px ${cfg.primary}88)` }}
                  >
                    {cfg.icon}
                  </span>
                  <span
                    className="font-display text-[0.72rem] font-black uppercase tracking-[0.18em]"
                    style={{
                      color: cfg.primary,
                      textShadow: `0 0 10px ${cfg.primary}99`,
                    }}
                  >
                    {segment}
                  </span>
                </div>
              </div>

              {/* Divider line */}
              <div
                className="absolute inset-0 origin-center pointer-events-none"
                style={{ transform: `rotate(${endAngle}deg)` }}
              >
                <div className="absolute top-0 left-1/2 w-[1.5px] h-1/2 bg-gradient-to-b from-purple-500/25 via-purple-900/10 to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Inner ring detail */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "12%",
            border: "1px solid rgba(139,92,246,0.12)",
            background: "transparent",
          }}
        />
      </motion.div>

      {/* ---- Layer 4: Glass protective layer (fake glare) ---- */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.02) 70%, transparent 100%)",
          zIndex: Z.SEGMENT_CONTENT,
        }}
      />

      {/* ---- Layer 5: Animated energy ring ---- */}
      <motion.div
        animate={energyControls}
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "6%",
          border: "1.5px solid transparent",
          borderTopColor: "rgba(212,168,83,0.5)",
          borderRightColor: "rgba(212,168,83,0.15)",
          zIndex: Z.ENERGY_RING,
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: WHEEL_VISUAL.ENERGY_RING_PERIOD * 0.7 / 1000, repeat: Infinity, ease: "linear" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "10%",
          border: "1px solid transparent",
          borderBottomColor: "rgba(139,92,246,0.35)",
          borderLeftColor: "rgba(139,92,246,0.1)",
          zIndex: Z.ENERGY_RING,
        }}
      />

      {/* ---- Layer 6: Center hub ---- */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: Z.CENTER_HUB }}
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(0,0,0,0.9), inset 0 0 12px rgba(139,92,246,0.35)",
              "0 0 30px rgba(0,0,0,0.9), inset 0 0 20px rgba(139,92,246,0.55)",
              "0 0 20px rgba(0,0,0,0.9), inset 0 0 12px rgba(139,92,246,0.35)",
            ],
          }}
          transition={{
            duration: WHEEL_VISUAL.HUB_PULSE_PERIOD / 1000,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[88px] h-[88px] rounded-full flex items-center justify-center border-[3px] border-purple-800/70"
          style={{
            background: "radial-gradient(circle at 40% 30%, #2a0f4a 0%, #150828 50%, #080415 100%)",
          }}
        >
          {/* Inner detail ring */}
          <div className="absolute inset-[6px] rounded-full border border-purple-600/20" />
          <span
            className="font-display text-[2.2rem] font-black select-none"
            style={{
              color: "#c084fc",
              textShadow: "0 0 18px rgba(168,85,247,0.7)",
            }}
          >
            P
          </span>
        </motion.div>
      </div>

      {/* ---- Layer 7: Dynamic reflection shimmer ---- */}
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{
          duration: WHEEL_VISUAL.REFLECTION_PERIOD / 1000,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, rgba(255,255,255,0.03) 60%, transparent 100%)",
          backgroundSize: "200% 200%",
          zIndex: Z.CENTER_HUB + 1,
        }}
      />

      {/* ---- Layer 8: Premium needle ---- */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ top: "-4px", zIndex: Z.NEEDLE }}
      >
        <motion.div
          animate={pointerControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "50% 85%" }}
        >
          {/* Needle shadow */}
          <div
            className="absolute inset-0 blur-[3px] opacity-60"
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "36px solid rgba(0,0,0,0.6)",
            }}
          />
          {/* Needle body — gold with gem tip */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop: "34px solid #FFD700",
              filter: "drop-shadow(0 0 6px rgba(255,215,0,0.8))",
            }}
          />
          {/* Pin base */}
          <div
            className="absolute rounded-full border border-purple-500/60"
            style={{
              width: 14,
              height: 14,
              top: 22,
              left: "50%",
              transform: "translateX(-50%)",
              background: "radial-gradient(circle at 40% 30%, #3b1f6e 0%, #1a0d38 100%)",
              boxShadow: "0 0 8px rgba(139,92,246,0.5)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ---- Arc path generator (used by segment clip-path) ----

function buildArcPath(startAngle: number, endAngle: number): string {
  const r = 50;
  const pts: string[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    const rad = (a - 90) * (Math.PI / 180);
    pts.push(`${50 + r * Math.cos(rad)}% ${50 + r * Math.sin(rad)}%`);
  }
  return pts.join(", ");
}
