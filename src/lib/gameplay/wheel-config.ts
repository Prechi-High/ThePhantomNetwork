/**
 * Wheel geometry — shared domain config (server + client).
 * UI-specific tuning remains in premium-wheel/config.ts.
 */

import { WHEEL_CONFIG, WHEEL_PHYSICS } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

/** Final rotation (degrees) to seat `outcome` under the needle */
export function getTargetRotation(outcome: SpinOutcome): number {
  const index = WHEEL_CONFIG.SEGMENT_ORDER.indexOf(outcome);
  if (index === -1) return 0;
  const sectorCenter = index * WHEEL_CONFIG.SEGMENT_ANGLE;
  const extraSpins = WHEEL_PHYSICS.BASE_ROTATIONS * 360;
  return extraSpins + (360 - sectorCenter);
}

/** API route compat — accepts segment index instead of outcome string */
export function getTargetAngle(targetIndex: number): number {
  const clampedIndex = Math.max(0, Math.min(targetIndex, WHEEL_CONFIG.SEGMENT_ORDER.length - 1));
  const outcome = WHEEL_CONFIG.SEGMENT_ORDER[clampedIndex];
  return getTargetRotation(outcome);
}

export function getSectorIndex(id: SpinOutcome): number {
  return WHEEL_CONFIG.SEGMENT_ORDER.indexOf(id);
}
