import { WHEEL_CONFIG } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

export interface WheelSector {
  id: SpinOutcome;
  label: string;
  centerAngle: number; // Degrees from top (0°)
}

export const WHEEL_SECTORS: WheelSector[] = WHEEL_CONFIG.SEGMENT_ORDER.map((id, index) => {
  // Sector 0 (ADVANCE) is centered at 0°
  // Sector 1 (ACQUIRE) is centered at 72°
  // Sector 2 (STEAL) is centered at 144°
  // Sector 3 (VOID) is centered at 216°
  // Sector 4 (DISCOVER) is centered at 288°
  return {
    id,
    label: id,
    centerAngle: index * WHEEL_CONFIG.SEGMENT_ANGLE,
  };
});

export const getTargetAngle = (targetIndex: number): number => {
  const sector = WHEEL_SECTORS[targetIndex % 5];
  if (!sector) return 0;
  // Calculate target rotation so sector center is at top (0°)
  // Rotate wheel clockwise by (360 - sector.centerAngle) degrees
  const targetRotation = (360 - sector.centerAngle) % 360;
  return targetRotation;
};

export const getSectorIndex = (id: SpinOutcome): number => {
  return WHEEL_CONFIG.SEGMENT_ORDER.indexOf(id);
};
