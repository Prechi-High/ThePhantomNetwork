"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicCountdownProps {
  onComplete: () => void;
}

const STEPS = ["5", "4", "3", "2", "1", "GO"] as const;

export function CinematicCountdown({ onComplete }: CinematicCountdownProps) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step >= STEPS.length) {
      setDone(true);
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const delay = step === STEPS.length - 1 ? 800 : 900;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, onComplete]);

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
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
          animate={{
            scale: isGo ? 1.3 : 1,
            opacity: 1,
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

      {/* Energy pulse ring on GO */}
      {isGo && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "2px solid rgba(212,168,83,0.6)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
