"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/** Omit drag/animation handlers that conflict with framer-motion's motion.div typings */
type CardDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

interface CardProps extends CardDivProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  glow,
  hoverable = false,
  ...rest
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "glass rounded-[var(--radius-lg)] p-4 transition-all duration-300",
        glow && "shadow-[var(--shadow-glow-purple)]",
        hoverable && "hover:shadow-[var(--shadow-glow-purple)]",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
