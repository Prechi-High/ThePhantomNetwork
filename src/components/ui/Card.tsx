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
        "rounded-2xl border border-legacy-divider bg-legacy-card p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
        glow && "border-legacy-gold/30 shadow-[0_0_30px_rgba(245,185,66,0.25)]",
        hoverable && "transition-colors hover:bg-legacy-surface-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
