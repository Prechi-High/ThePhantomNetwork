import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className, glow, hoverable = false }: CardProps) {
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
    >
      {children}
    </motion.div>
  );
}
