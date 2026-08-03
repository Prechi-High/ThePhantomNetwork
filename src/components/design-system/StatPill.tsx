import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: string | number;
  accent?: "gold" | "blue" | "emerald" | "amber";
  className?: string;
}

const accents = {
  gold: "text-legacy-gold",
  blue: "text-legacy-blue",
  emerald: "text-legacy-emerald",
  amber: "text-legacy-amber",
};

export function StatPill({ label, value, accent = "gold", className }: StatPillProps) {
  return (
    <div className={cn("rounded-xl border border-legacy-border bg-legacy-card px-4 py-3 text-center", className)}>
      <p className={cn("text-lg font-bold tabular-nums", accents[accent])}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-legacy-muted">{label}</p>
    </div>
  );
}
