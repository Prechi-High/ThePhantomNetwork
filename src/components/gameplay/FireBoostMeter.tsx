"use client";

import { motion } from "framer-motion";
import { MAX_FIRE_BOOST_TAPS } from "@/types/gameplay";

interface FireBoostMeterProps {
  taps: number;
  maxTaps?: number;
  onTap: () => void;
  disabled?: boolean;
}

export function FireBoostMeter({
  taps,
  maxTaps = MAX_FIRE_BOOST_TAPS,
  onTap,
  disabled,
}: FireBoostMeterProps) {
  const fillPercent = (taps / maxTaps) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-phantom-muted">Tap to amplify steal</p>
      <motion.button
        onClick={onTap}
        disabled={disabled || taps >= maxTaps}
        whileTap={{ scale: 0.9 }}
        className="relative h-20 w-16 rounded-b-2xl rounded-t-lg border-2 border-phantom-danger bg-phantom-surface disabled:opacity-50"
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400"
          animate={{ height: `${fillPercent}%` }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <span className="relative z-10 text-2xl">🔥</span>
      </motion.button>
      <span className="font-mono text-sm text-phantom-gold">
        {taps}/{maxTaps} boosts
      </span>
    </div>
  );
}
