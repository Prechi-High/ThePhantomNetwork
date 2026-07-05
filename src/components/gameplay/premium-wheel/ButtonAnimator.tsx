"use client";

import { motion } from "framer-motion";

interface ButtonAnimatorProps {
  state: "idle" | "cooldown" | "success";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ButtonAnimator({
  state,
  disabled,
  onClick,
  className,
}: ButtonAnimatorProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-full border-none bg-transparent p-0 ${className}`}
      style={{ width: 200, height: 200 }}
    >
      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/40 via-transparent to-yellow-500/40 rounded-full blur-xl animate-pulse" />
      
      {/* Main Button */}
      <div className="relative h-full w-full">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 shadow-[0_0_40px_rgba(234,179,8,0.6)]">
          {/* Inner Ring */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-900/90 via-yellow-800 to-yellow-950 flex items-center justify-center border border-yellow-600/50">
            {/* Center Content */}
            <div className="text-center">
              <span className="block font-display text-4xl font-black text-yellow-300 drop-shadow-lg">
                SPIN
              </span>
              <span className="block mt-1 font-mono text-sm text-yellow-500/80">
                HOLD FOR AUTO
              </span>
            </div>
          </div>
        </div>
        
        {/* Top Highlight */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-full blur-sm" />
      </div>
    </motion.button>
  );
}
