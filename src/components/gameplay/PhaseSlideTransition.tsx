"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { interactionController } from "@/lib/motion/InteractionController";

interface PhaseSlideTransitionProps {
  phase: number;
  children: ReactNode;
}

const SLIDE_DURATION = 1.05;
const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Visual-only phase transition. Gameplay children stay fixed — never transformed —
 * so fixed overlays (reveal, steal picker, modals) remain stable.
 */
export function PhaseSlideTransition({ phase, children }: PhaseSlideTransitionProps) {
  const prevPhaseRef = useRef(phase);
  const [curtainPhase, setCurtainPhase] = useState<number | null>(null);

  useEffect(() => {
    if (phase <= prevPhaseRef.current) return;

    prevPhaseRef.current = phase;
    setCurtainPhase(phase);
    if (phase > 1) interactionController.playSound("phase_end");

    const timer = setTimeout(() => setCurtainPhase(null), SLIDE_DURATION * 1000 + 80);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <>
      {/* Gameplay shell — no transforms, always viewport-fixed */}
      <div className="fixed inset-0 overflow-hidden bg-[#04020a]">{children}</div>

      {/* Decorative curtain slides up; does not wrap or move gameplay */}
      <AnimatePresence>
        {curtainPhase != null && (
          <>
            <motion.div
              key={`curtain-${curtainPhase}`}
              className="pointer-events-none fixed inset-0 z-[200] bg-[#04020a]"
              initial={{ y: "100%" }}
              animate={{ y: "-100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
            />
            <motion.div
              key={`badge-${curtainPhase}`}
              className="pointer-events-none fixed inset-x-0 top-[18%] z-[201] flex justify-center"
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="rounded-full border border-purple-400/50 bg-black/75 px-6 py-2.5 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.35)]">
                <span className="text-[12px] font-bold tracking-[0.3em] text-purple-200 uppercase">
                  Phase {curtainPhase}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
