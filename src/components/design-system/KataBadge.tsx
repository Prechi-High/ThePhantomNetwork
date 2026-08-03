import { cn } from "@/lib/utils";

type KataStage = "Pathfinder" | "Squad Master" | "Camp Master" | "Strategist" | "Legacy";

interface KataBadgeProps {
  stage: KataStage;
  stageNumber?: number;
  className?: string;
}

const stageColors: Record<KataStage, string> = {
  Pathfinder: "bg-legacy-blue/20 text-legacy-blue border-legacy-blue/30",
  "Squad Master": "bg-legacy-emerald/20 text-legacy-emerald border-legacy-emerald/30",
  "Camp Master": "bg-legacy-gold/20 text-legacy-gold border-legacy-gold/30",
  Strategist: "bg-legacy-amber/20 text-legacy-amber border-legacy-amber/30",
  Legacy: "bg-legacy-crimson/20 text-legacy-crimson border-legacy-crimson/30",
};

export function KataBadge({ stage, stageNumber = 1, className }: KataBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase", stageColors[stage], className)}>
      {stage} · {stageNumber}
    </span>
  );
}
