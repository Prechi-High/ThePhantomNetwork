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
        "rounded-[var(--radius-lg)] border border-phantom-border bg-phantom-surface p-4 transition-all duration-200",
        glow && "shadow-[var(--shadow-glow-gold)]",
        hoverable && "hover:border-phantom-border-subtle cursor-pointer hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
