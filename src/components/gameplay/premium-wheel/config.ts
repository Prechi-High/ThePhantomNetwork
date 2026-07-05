import type { SpinOutcome } from "@/types/gameplay";

export interface WheelSector {
  id: SpinOutcome;
  label: string;
  centerAngle: number; // Degrees from top (0°)
}

// Artwork calibration constants
export const ARTWORK_ROTATION_OFFSET = 0; // Degrees - adjust after analyzing artwork
export const SECTOR_WIDTH = 72; // Degrees per sector (360 / 5)

// Sector order and exact center angles (from top, clockwise)
export const WHEEL_SECTORS: WheelSector[] = [
  { id: "ADVANCE", label: "ADVANCE", centerAngle: 36 },
  { id: "ACQUIRE", label: "ACQUIRE", centerAngle: 108 },
  { id: "DISCOVER", label: "DISCOVER", centerAngle: 180 },
  { id: "STEAL", label: "STEAL", centerAngle: 252 },
  { id: "VOID", label: "VOID", centerAngle: 324 },
];

// Helper to get target rotation for a sector (clockwise)
export const getTargetAngle = (targetIndex: number): number => {
  const sector = WHEEL_SECTORS[targetIndex];
  // Calculate target rotation so sector center is at top (0°)
  // Rotate wheel clockwise by (360 - sector.centerAngle) degrees
  const targetRotation = (360 - sector.centerAngle + ARTWORK_ROTATION_OFFSET) % 360;
  return targetRotation;
};

// Helper to find index of sector by id
export const getSectorIndex = (id: SpinOutcome): number => {
  return WHEEL_SECTORS.findIndex((s) => s.id === id);
};
