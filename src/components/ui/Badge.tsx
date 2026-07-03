import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "danger" | "muted" | "success" | "purple";
  className?: string;
}

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  const variants = {
    gold: "bg-phantom-gold/20 text-phantom-gold border border-phantom-gold/30",
    danger: "bg-phantom-danger/20 text-phantom-danger border border-phantom-danger/30",
    muted: "bg-phantom-border text-phantom-muted border border-phantom-border",
    success: "bg-phantom-success/20 text-phantom-success border border-phantom-success/30",
    purple: "bg-phantom-purple/20 text-phantom-purple border border-phantom-purple/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
