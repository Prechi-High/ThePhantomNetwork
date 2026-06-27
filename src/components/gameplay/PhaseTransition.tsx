"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PhaseTransitionProps {
  phase: number;
  visible: boolean;
}

const PHASE_NAMES = ["", "Phase 1 — Spin", "Phase 2 — Survive", "Phase 3 — Eliminate", "Championship"];

export function PhaseTransition({ phase, visible }: PhaseTransitionProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-phantom-bg/90"
        >
          <motion.h2
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-4xl font-bold text-phantom-gold"
          >
            {PHASE_NAMES[phase] ?? `Phase ${phase}`}
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
