"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className, glow, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-[var(--radius-lg)] p-4 transition-shadow duration-300",
        glow && "shadow-[var(--shadow-glow-purple)]",
        hoverable && "hover:shadow-[var(--shadow-glow-purple)]",
        className
      )}
    >
      {children}
    </div>
  );
}
