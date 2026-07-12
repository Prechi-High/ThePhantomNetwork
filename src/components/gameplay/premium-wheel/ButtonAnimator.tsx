"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASING } from "@/config/spinConfig";
import { BUTTON_CONFIG } from "./config";

interface ButtonAnimatorProps {
  disabled?: boolean;
  isSpinning?: boolean;
  onClick?: () => void;
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * ButtonAnimator — The Engage Charge Trigger
 *
 * Idle:     soft pulse + energy shimmer + breathing glow
 * Hover:    scale up + glow intensify
 * Press:    compress → energy ripple → charge flash → wheel launches
 * Spinning: locked state with orbit ring
 * Disabled: dim, no interactions
 */
export function ButtonAnimator({
  disabled = false,
  isSpinning = false,
  onClick,
  className = "",
}: ButtonAnimatorProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [charged, setCharged] = useState(false);
  const rippleId = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Clear charged flash after animation completes
  useEffect(() => {
    if (!charged) return;
    const t = setTimeout(() => setCharged(false), BUTTON_CONFIG.CHARGE_DURATION);
    return () => clearTimeout(t);
  }, [charged]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || isSpinning) return;

      // Spawn ripple at press position relative to button centre
      const rect = btnRef.current?.getBoundingClientRect();
      const cx = rect ? e.clientX - rect.left - rect.width / 2 : 0;
      const cy = rect ? e.clientY - rect.top - rect.height / 2 : 0;
      const id = ++rippleId.current;
      setRipples((prev) => [...prev, { id, x: cx, y: cy }]);
      setTimeout(
        () => setRipples((prev) => prev.filter((r) => r.id !== id)),
        BUTTON_CONFIG.RIPPLE_DURATION,
      );
    },
    [disabled, isSpinning],
  );

  const handleClick = useCallback(() => {
    if (disabled || isSpinning) return;
    setCharged(true);
    onClick?.();
  }, [disabled, isSpinning, onClick]);

  const isActive = !disabled && !isSpinning;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* ---- Outer ambient halo (idle breathing) ---- */}
      <motion.div
        animate={
          isActive
            ? {
                opacity: [0.15, 0.35, 0.15],
                scale: [1, 1.12, 1],
              }
            : { opacity: 0.05, scale: 1 }
        }
        transition={{
          duration: BUTTON_CONFIG.IDLE_PULSE_DURATION / 1000,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: BUTTON_CONFIG.SIZE + 64,
          height: BUTTON_CONFIG.SIZE + 64,
          background:
            "radial-gradient(circle, rgba(212,168,83,0.5) 0%, transparent 70%)",
        }}
      />

      {/* ---- Second pulse ring (offset phase) ---- */}
      <motion.div
        animate={
          isActive
            ? {
                opacity: [0.08, 0.22, 0.08],
                scale: [1, 1.2, 1],
              }
            : { opacity: 0 }
        }
        transition={{
          duration: BUTTON_CONFIG.IDLE_PULSE_DURATION / 1000,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7,
        }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: BUTTON_CONFIG.SIZE + 96,
          height: BUTTON_CONFIG.SIZE + 96,
          background:
            "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
        }}
      />

      {/* ---- Spinning orbit ring ---- */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotate: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: BUTTON_CONFIG.SIZE + 24,
              height: BUTTON_CONFIG.SIZE + 24,
              border: "2px solid transparent",
              borderTopColor: "rgba(212,168,83,0.7)",
              borderRightColor: "rgba(212,168,83,0.3)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ---- Main button ---- */}
      <motion.button
        ref={btnRef}
        whileHover={isActive ? { scale: BUTTON_CONFIG.HOVER_SCALE } : undefined}
        whileTap={
          isActive
            ? {
                scale: BUTTON_CONFIG.COMPRESS_SCALE,
                transition: { duration: 0.1, ease: EASING.EASE_OUT },
              }
            : undefined
        }
        animate={
          charged
            ? { scale: [0.93, 1.08, 1], transition: { duration: 0.35 } }
            : undefined
        }
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        disabled={disabled || isSpinning}
        className="relative overflow-hidden rounded-full cursor-pointer select-none focus:outline-none"
        style={{
          width: BUTTON_CONFIG.SIZE,
          height: BUTTON_CONFIG.SIZE,
          opacity: disabled ? 0.4 : 1,
        }}
        aria-label="Engage spin"
      >
        {/* Outer metallic ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b, #ffd700, #b8860b)",
            boxShadow: isActive
              ? "0 0 40px rgba(212,168,83,0.6), 0 0 80px rgba(212,168,83,0.2)"
              : "0 0 12px rgba(212,168,83,0.2)",
          }}
        />

        {/* Inner bevel */}
        <div
          className="absolute inset-[4px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 30%, #2d1a00 0%, #1a0e00 50%, #0d0600 100%)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
          }}
        />

        {/* Energy shimmer layer */}
        <motion.div
          animate={
            isActive
              ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  opacity: [0.15, 0.4, 0.15],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[4px] rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, rgba(255,215,0,0.25) 50%, transparent 100%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Top highlight — gives 3D dome effect */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: "8%",
            left: "15%",
            width: "70%",
            height: "35%",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 100%)",
          }}
        />

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="font-display font-black tracking-widest text-phantom-gold drop-shadow-lg"
            style={{ fontSize: "1.5rem", lineHeight: 1 }}
          >
            {isSpinning ? "•••" : "ENGAGE"}
          </span>
          {!isSpinning && (
            <span
              className="text-[0.6rem] font-mono tracking-[0.3em] uppercase"
              style={{ color: "rgba(212,168,83,0.55)" }}
            >
              TAP TO SPIN
            </span>
          )}
        </div>

        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: BUTTON_CONFIG.RIPPLE_DURATION / 1000,
                ease: EASING.EASE_OUT,
              }}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 60,
                height: 60,
                left: r.x + BUTTON_CONFIG.SIZE / 2 - 30,
                top: r.y + BUTTON_CONFIG.SIZE / 2 - 30,
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Charge flash */}
        <AnimatePresence>
          {charged && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: BUTTON_CONFIG.CHARGE_DURATION / 1000 }}
              className="absolute inset-0 rounded-full pointer-events-none bg-amber-300"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
