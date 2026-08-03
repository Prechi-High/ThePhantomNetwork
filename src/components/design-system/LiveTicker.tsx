import { cn } from "@/lib/utils";

interface LiveTickerProps {
  items: string[];
  className?: string;
}

export function LiveTicker({ items, className }: LiveTickerProps) {
  if (!items.length) return null;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-legacy-divider bg-legacy-surface px-3 py-2",
        className
      )}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-legacy-emerald">
        Live
      </p>
      <ul className="space-y-1">
        {items.slice(0, 3).map((t, i) => (
          <li key={i} className="truncate text-xs text-legacy-muted">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.18em] text-legacy-muted",
        className
      )}
    >
      {children}
    </h2>
  );
}
