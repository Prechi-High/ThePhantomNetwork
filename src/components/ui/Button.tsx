import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-phantom-gold text-phantom-bg hover:bg-phantom-gold-dim font-semibold shadow-[var(--shadow-glow-gold)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)]",
    secondary:
      "bg-phantom-surface border border-phantom-border hover:border-phantom-gold text-white hover:bg-phantom-surface-hover",
    danger:
      "bg-phantom-danger text-white hover:opacity-90 shadow-[var(--shadow-glow-danger)]",
    ghost: "text-phantom-muted hover:text-white hover:bg-phantom-surface/50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "rounded-[var(--radius-lg)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
