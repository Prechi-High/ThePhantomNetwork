import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-phantom-border bg-phantom-surface p-4",
        glow && "shadow-[0_0_20px_rgba(212,168,83,0.15)]",
        className
      )}
    >
      {children}
    </div>
  );
}
