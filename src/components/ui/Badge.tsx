import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "danger" | "muted";
}

export function Badge({ children, variant = "gold" }: BadgeProps) {
  const variants = {
    gold: "bg-phantom-gold/20 text-phantom-gold border-phantom-gold/30",
    danger: "bg-phantom-danger/20 text-phantom-danger border-phantom-danger/30",
    muted: "bg-phantom-border text-phantom-muted border-phantom-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
