"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

const CARD_FLOAT: TargetAndTransition = { y: [0, -4, 0] };
const CARD_FLOAT_TRANSITION: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };
const CARD_HOVER: TargetAndTransition = { y: -6, scale: 1.02 };

export function MotionCard({ children, className, glow, hoverable = false }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, ...CARD_FLOAT }}
      transition={CARD_FLOAT_TRANSITION}
      whileHover={hoverable ? CARD_HOVER : undefined}
      className={cn(
        "glass rounded-[var(--radius-lg)] p-4 transition-shadow duration-300",
        glow && "shadow-[var(--shadow-glow-purple)]",
        hoverable && "hover:shadow-[var(--shadow-glow-purple)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
