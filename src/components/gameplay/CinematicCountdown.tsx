"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { appEvents } from "@/lib/motion/appEvents";

interface CinematicCountdownProps {
  onComplete: () => void;
}

const STEPS = ["5", "4", "3", "2", "1", "GO"] as const;

export function CinematicCountdown({ onComplete }: CinematicCountdownProps) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const ringRef = useRef<HTMLDivElement>(null);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (step >= STEPS.length) {
      setDone(true);
      const t = setTimeout(() => onCompleteRef.current(), 600);
      return () => clearTimeout(t);
    }

    const label = STEPS[step];
    if (label === "GO") {
      appEvents.emit({ type: "COUNTDOWN_GO", timestamp: Date.now(), source: "system" });
    } else {
      appEvents.emit({ type: "COUNTDOWN_TICK", timestamp: Date.now(), payload: { value: label }, source: "system" });
    }

    if (ringRef.current) {
      gsap.fromTo(ringRef.current, { scale: 0.8, opacity: 0.6 }, { scale: 2.2, opacity: 0, duration: 0.7, ease: "power2.out" });
    }

    const delay = step === STEPS.length - 1 ? 800 : 900;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step]);

  if (done) return null;

  const label = STEPS[step];
  const isGo = label === "GO";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, rgba(88,28,135,0.4), rgba(4,2,10,0.98))",
      }}
    >
      <div ref={ringRef} className="absolute w-[200px] h-[200px] rounded-full border-2 border-purple-400/50 pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
          animate={{
            scale: isGo ? [0.5, 1.15, 1.3] : [0.5, 1.15, 1],
            opacity: [0, 1, 0.9],
            filter: "blur(0px)",
          }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: isGo ? "clamp(64px, 15vw, 120px)" : "clamp(80px, 20vw, 160px)",
            fontWeight: 900,
            fontFamily: "var(--font-display)",
            color: isGo ? "#d4a853" : "#fff",
            textShadow: isGo
              ? "0 0 60px rgba(212,168,83,0.8), 0 0 120px rgba(212,168,83,0.4)"
              : "0 0 40px rgba(139,92,246,0.6)",
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
