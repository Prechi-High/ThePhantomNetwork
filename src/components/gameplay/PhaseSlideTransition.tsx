"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";

interface PhaseSlideTransitionProps {
  phase: number;
  children: ReactNode;
}

const SLIDE_DURATION = 1.05;
const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PhaseSlideTransition({ phase, children }: PhaseSlideTransitionProps) {
  const controls = useAnimation();
  const isFirstMount = useRef(true);
  const prevPhaseRef = useRef(phase);
  const [showBadge, setShowBadge] = useState(false);
  const [exitingPhase, setExitingPhase] = useState<number | null>(null);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPhaseRef.current = phase;
      return;
    }

    if (phase === prevPhaseRef.current) return;
    if (phase < prevPhaseRef.current) return;

    setExitingPhase(prevPhaseRef.current);
    prevPhaseRef.current = phase;

    setShowBadge(true);
    const badgeTimer = setTimeout(() => setShowBadge(false), 900);

    controls.set({ y: "100%" });
    void controls.start({
      y: 0,
      transition: { duration: SLIDE_DURATION, ease: SLIDE_EASE },
    });

    const exitTimer = setTimeout(() => setExitingPhase(null), SLIDE_DURATION * 1000);

    return () => {
      clearTimeout(badgeTimer);
      clearTimeout(exitTimer);
    };
  }, [phase, controls]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04020a]">
      {/* Previous phase slides up and away */}
      <AnimatePresence>
        {exitingPhase != null && (
          <motion.div
            key={`exit-${exitingPhase}`}
            className="pointer-events-none fixed inset-0 z-10 bg-[#04020a]"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
          />
        )}
      </AnimatePresence>

      {/* Current phase — slides in from bottom without remounting children */}
      <motion.div className="fixed inset-0 z-20" animate={controls} initial={false}>
        {children}
      </motion.div>

      <AnimatePresence>
        {showBadge && (
          <motion.div
            key={`badge-${phase}`}
            className="pointer-events-none fixed inset-x-0 top-[18%] z-50 flex justify-center"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="rounded-full border border-purple-400/50 bg-black/75 px-6 py-2.5 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.35)]">
              <span className="text-[12px] font-bold tracking-[0.3em] text-purple-200 uppercase">
                Phase {phase}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
