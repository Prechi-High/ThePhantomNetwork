import { cn } from "@/lib/utils";

interface HeroFocusProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

/** One dominant focal block per screen (UX: one purpose) */
export function HeroFocus({ eyebrow, title, subtitle, children, className }: HeroFocusProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-legacy-divider bg-legacy-card p-6 text-center shadow-[var(--shadow-soft)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(245,185,66,0.18) 0%, transparent 55%)",
        }}
      />
      <div className="relative space-y-3">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-legacy-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-legacy-muted">{subtitle}</p>}
        {children && <div className="pt-2">{children}</div>}
      </div>
    </section>
  );
}
