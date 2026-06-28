import type { SpinOutcome } from "@/types/gameplay";

export interface WheelSector {
  id: SpinOutcome;
  label: string;
}

export const WHEEL_SECTORS: WheelSector[] = [
  { id: "ACQUIRE", label: "ACQUIRE" },
  { id: "DISCOVER", label: "DISCOVER" },
  { id: "VOID", label: "VOID" },
  { id: "ADVANCE", label: "ADVANCE" },
  { id: "STEAL", label: "STEAL" },
];

export const getSectorAngle = (sectors: WheelSector[]) => 360 / sectors.length;

export const getTargetAngle = (targetIndex: number, sectors: WheelSector[]) => {
  const sectorAngle = getSectorAngle(sectors);
  // Start from 0 (top) and add random offset inside sector
  const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.8);
  return -targetIndex * sectorAngle - randomOffset;
};
