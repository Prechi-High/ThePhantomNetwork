"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { appEvents } from "@/lib/motion/appEvents";
import { cn } from "@/lib/utils";

type MotionButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof motion.button>,
  "whileHover" | "whileTap" | "transition"
> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "purple";
  size?: "sm" | "md" | "lg";
};

const BUTTON_HOVER: TargetAndTransition = { scale: 1.03, y: -2, boxShadow: "0 0 20px rgba(139,92,246,0.5)" };
const BUTTON_TAP: TargetAndTransition = { scale: 0.96, y: 0 };
const BUTTON_TRANSITION: Transition = { type: "spring", stiffness: 400, damping: 22 };

export function MotionButton({
  className,
  variant = "primary",
  size = "md",
  children,
  onClick,
  ...props
}: MotionButtonProps) {
  const variants = {
    primary:
      "bg-phantom-gold text-phantom-bg hover:bg-phantom-gold-dim font-semibold shadow-[var(--shadow-glow-gold)]",
    purple:
      "bg-phantom-purple text-white hover:bg-phantom-purple-bright font-semibold shadow-[var(--shadow-glow-purple)]",
    secondary: "glass hover:border-phantom-purple text-white",
    danger: "bg-phantom-danger text-white hover:opacity-90",
    ghost: "text-phantom-muted hover:text-white hover:bg-phantom-surface/80",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      className={cn(
        "rounded-[var(--radius-lg)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={BUTTON_HOVER}
      whileTap={BUTTON_TAP}
      transition={BUTTON_TRANSITION}
      onClick={(e) => {
        appEvents.emit({ type: "BUTTON_PRESS", timestamp: Date.now(), source: "player" });
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
