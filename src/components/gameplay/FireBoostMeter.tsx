"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_FIRE_BOOST_TAPS } from "@/types/gameplay";

interface FireBoostMeterProps {
  taps: number;
  maxTaps?: number;
  onTap: () => void;
  disabled?: boolean;
}

/**
 * FireBoostMeter — Power state visualizer
 *
 * Not a progress bar. An energy core.
 * As boost fills: core intensifies → energy leaks → heat distorts → player wants more.
 */
export function FireBoostMeter({ taps, maxTaps = MAX_FIRE_BOOST_TAPS, onTap, disabled }: FireBoostMeterProps) {
  const fillPct    = Math.min(1, taps / maxTaps);
  const isFull     = taps >= maxTaps;
  const [burst, setBurst] = useState(false);
  const prevTaps = useRef(taps);

  // Trigger burst flash on each tap
  useEffect(() => {
    if (taps > prevTaps.current) {
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 300);
      prevTaps.current = taps;
      return () => clearTimeout(t);
    }
    prevTaps.current = taps;
  }, [taps]);

  // Pulse speed scales with fill
  const pulseDuration = 2.0 - fillPct * 1.2; // 2.0s → 0.8s
  const coreGlow      = 6 + fillPct * 30;     // glow radius grows

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

      {/* Energy core button */}
      <motion.button
        onClick={() => { if (!disabled && !isFull) onTap(); }}
        disabled={disabled || isFull}
        whileTap={!disabled && !isFull ? { scale: 0.88 } : undefined}
        style={{
          position: "relative",
          width: 80,
          height: 100,
          background: "none",
          border: "none",
          cursor: disabled || isFull ? "not-allowed" : "pointer",
          outline: "none",
          padding: 0,
        }}
      >
        {/* Outer heat distortion ring */}
        <motion.div
          animate={{
            scale: [1, 1 + fillPct * 0.18, 1],
            opacity: [0.3, 0.6 + fillPct * 0.3, 0.3],
          }}
          transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
            background: `radial-gradient(circle, rgba(249,115,22,${0.1 + fillPct * 0.3}) 0%, transparent 70%)`,
            filter: `blur(${4 + fillPct * 8}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Second pulse ring */}
        <motion.div
          animate={{ scale: [1, 1 + fillPct * 0.25, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: pulseDuration * 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "55% 45% 40% 60% / 45% 55% 50% 50%",
            border: `1px solid rgba(239,68,68,${0.2 + fillPct * 0.5})`,
            pointerEvents: "none",
          }}
        />

        {/* Core container */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "12px 12px 20px 20px",
          background: "linear-gradient(180deg,rgba(30,10,5,0.95),rgba(20,5,2,0.98))",
          border: `1.5px solid rgba(239,68,68,${0.3 + fillPct * 0.5})`,
          overflow: "hidden",
          boxShadow: `0 0 ${coreGlow}px rgba(249,115,22,${0.4 + fillPct * 0.4}), inset 0 0 20px rgba(0,0,0,0.8)`,
        }}>
          {/* Lava fill */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fillPct * 100}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: "0 0 18px 18px",
              background: isFull
                ? "linear-gradient(180deg,#fbbf24 0%,#f97316 30%,#dc2626 70%,#7f1d1d 100%)"
                : "linear-gradient(180deg,#f97316 0%,#dc2626 50%,#7f1d1d 100%)",
              boxShadow: `inset 0 0 20px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Lava surface glow */}
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: pulseDuration * 0.6, repeat: Infinity }}
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "20%",
                background: "linear-gradient(180deg,rgba(255,200,50,0.6),transparent)",
                borderRadius: "50% 50% 0 0 / 30% 30% 0 0",
              }}
            />

            {/* Rotating flame particles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "50%",
                  width: "60%",
                  height: "60%",
                  marginLeft: "-30%",
                  borderRadius: "50%",
                  border: `1px solid rgba(255,200,50,${0.1 + i * 0.08})`,
                  opacity: fillPct,
                }}
              />
            ))}
          </motion.div>

          {/* Flame icon */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
            <motion.span
              animate={{ scale: [1, 1 + fillPct * 0.15, 1] }}
              transition={{ duration: pulseDuration, repeat: Infinity }}
              style={{ fontSize: 28, filter: `drop-shadow(0 0 ${4 + fillPct * 8}px rgba(249,115,22,0.9))` }}
            >
              🔥
            </motion.span>
          </div>

          {/* Tap burst flash */}
          <AnimatePresence>
            {burst && (
              <motion.div
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: 0, background: "rgba(255,200,50,0.35)", borderRadius: "inherit", pointerEvents: "none" }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* FULL indicator */}
        {isFull && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "2px 8px",
              borderRadius: 9999,
              background: "rgba(249,115,22,0.2)",
              border: "1px solid rgba(249,115,22,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 900, color: "#f97316", letterSpacing: "0.15em" }}>MAXED</span>
          </motion.div>
        )}
      </motion.button>

      {/* Tap count + label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
          {Array.from({ length: maxTaps }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < taps ? { scale: [1, 1.4, 1], background: "#f97316" } : { background: "rgba(107,114,128,0.3)" }}
              transition={i < taps ? { duration: 0.3 } : undefined}
              style={{ width: 6, height: 6, borderRadius: "50%", boxShadow: i < taps ? "0 0 6px rgba(249,115,22,0.7)" : "none" }}
            />
          ))}
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(249,115,22,0.7)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {isFull ? "FIRE BOOST READY" : `${taps}/${maxTaps} CHARGED`}
        </span>
      </div>
    </div>
  );
}
