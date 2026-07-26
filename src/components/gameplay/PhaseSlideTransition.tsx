"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PhaseSlideTransitionProps {
  phase: number;
  children: ReactNode;
}

export function PhaseSlideTransition({ phase, children }: PhaseSlideTransitionProps) {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    setShowBadge(true);
    const timer = setTimeout(() => setShowBadge(false), 400);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={phase}
          className="fixed inset-0"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showBadge && (
          <motion.div
            key={`badge-${phase}`}
            className="pointer-events-none fixed inset-x-0 top-[18%] z-50 flex justify-center"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-full border border-purple-400/40 bg-black/70 px-5 py-2 backdrop-blur-sm">
              <span className="text-[11px] font-bold tracking-[0.25em] text-purple-300 uppercase">
                Phase {phase}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
