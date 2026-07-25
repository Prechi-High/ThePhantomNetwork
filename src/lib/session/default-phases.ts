import type { PhaseEntry } from "@/types/gameplay";

export const DEFAULT_PHASES: PhaseEntry[] = [
  {
    phase: 1,
    duration_minutes: 6,
    elimination_rule: "target",
    config: { target: 38, revivable_min: 35, revivable_max: 37.5, eliminated_below: 35 },
  },
  {
    phase: 2,
    duration_minutes: 6,
    elimination_rule: "percentage",
    config: { eliminate_bottom_pct: 60 },
  },
  {
    phase: 3,
    duration_minutes: 5,
    elimination_rule: "percentage",
    config: { eliminate_bottom_pct: 70 },
  },
  {
    phase: 4,
    duration_minutes: 3,
    elimination_rule: "none",
    config: {},
  },
];

export const PRACTICE_DEFAULT_TITLE = "My AI Practice";
