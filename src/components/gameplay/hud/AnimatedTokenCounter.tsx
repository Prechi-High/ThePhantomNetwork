"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { TOKEN_TIMINGS } from "@/config/spinConfig";

interface AnimatedTokenCounterProps {
  value: number;
  isReceiving?: boolean;
  onReceivePulseEnd?: () => void;
  className?: string;
}

function formatToken(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function AnimatedTokenCounter({
  value,
  isReceiving = false,
  onReceivePulseEnd,
  className = "",
}: AnimatedTokenCounterProps) {
  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.8 });
  const display = useTransform(spring, (v) => formatToken(v));
  const [text, setText] = useState(formatToken(value));
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display]);

  useEffect(() => {
    if (!isReceiving) return;
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => {
      onReceivePulseEnd?.();
    }, TOKEN_TIMINGS.COUNTER_GLOW_DURATION);
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [isReceiving, onReceivePulseEnd]);

  return (
    <motion.div
      id="token-counter"
      className={`arena-tokens-row__value ${isReceiving ? "arena-tokens-row__value--receiving" : ""} ${className}`}
      animate={
        isReceiving
          ? {
              scale: [1, 1.08, 1],
              textShadow: [
                "0 0 0px rgba(234,179,8,0)",
                "0 0 18px rgba(234,179,8,0.85)",
                "0 0 0px rgba(234,179,8,0)",
              ],
            }
          : { scale: 1 }
      }
      transition={{ duration: TOKEN_TIMINGS.COUNTER_GLOW_DURATION / 1000, ease: "easeOut" }}
    >
      {text}
    </motion.div>
  );
}
