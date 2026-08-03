/** Legacy Milestone Progression — V5 spec thresholds */

export type KataStageName = "Pathfinder" | "Squad Master" | "Camp Master" | "Strategist" | "Legacy";

export interface StageThresholds {
  stages: [number, number, number, number, number];
  promotionThreshold: number;
}

export const MILESTONE_STAGES: Record<KataStageName, StageThresholds> = {
  Pathfinder: { stages: [0, 500, 1500, 3000, 5000], promotionThreshold: 10_000 },
  "Squad Master": { stages: [10_000, 15_000, 22_500, 32_500, 45_000], promotionThreshold: 60_000 },
  "Camp Master": { stages: [60_000, 80_000, 105_000, 135_000, 170_000], promotionThreshold: 210_000 },
  Strategist: { stages: [210_000, 260_000, 320_000, 390_000, 470_000], promotionThreshold: 560_000 },
  Legacy: { stages: [1_250_000, 1_500_000, 1_800_000, 2_150_000, 2_500_000], promotionThreshold: 2_500_000 },
};

const STAGE_ORDER: KataStageName[] = [
  "Pathfinder",
  "Squad Master",
  "Camp Master",
  "Strategist",
  "Legacy",
];

export function getKataStage(influence: number): { name: KataStageName; stageNumber: number } {
  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    const name = STAGE_ORDER[i];
    const t = MILESTONE_STAGES[name];
    if (influence >= t.stages[0]) {
      let stageNumber = 1;
      for (let s = t.stages.length - 1; s >= 0; s--) {
        if (influence >= t.stages[s]) {
          stageNumber = s + 1;
          break;
        }
      }
      return { name, stageNumber };
    }
  }
  return { name: "Pathfinder", stageNumber: 1 };
}

export function isMilestoneLocked(viewerStage: KataStageName, target: "Strategist" | "Legacy" | "Unknown"): boolean {
  if (target === "Strategist" || target === "Legacy") {
    const idx = STAGE_ORDER.indexOf(viewerStage);
    return idx < STAGE_ORDER.indexOf("Camp Master");
  }
  return false;
}
