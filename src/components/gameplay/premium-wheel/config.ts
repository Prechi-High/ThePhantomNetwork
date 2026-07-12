/**
 * Premium Wheel — Component-Level Configuration
 * Wheel-specific tuning that extends master spinConfig.ts
 * All timing values are in milliseconds unless noted.
 */

import { WHEEL_CONFIG, WHEEL_PHYSICS } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

// ---- Sector geometry ----

export interface WheelSector {
  id: SpinOutcome;
  label: string;
  /** Degrees clockwise from top (0°) */
  centerAngle: number;
  startAngle: number;
  endAngle: number;
}

export const WHEEL_SECTORS: WheelSector[] = WHEEL_CONFIG.SEGMENT_ORDER.map((id, index) => ({
  id,
  label: id,
  centerAngle: index * WHEEL_CONFIG.SEGMENT_ANGLE,
  startAngle: index * WHEEL_CONFIG.SEGMENT_ANGLE - WHEEL_CONFIG.SEGMENT_ANGLE / 2,
  endAngle: (index + 1) * WHEEL_CONFIG.SEGMENT_ANGLE - WHEEL_CONFIG.SEGMENT_ANGLE / 2,
}));

/** Final rotation (degrees) to seat `outcome` under the needle */
export function getTargetRotation(outcome: SpinOutcome): number {
  const index = WHEEL_CONFIG.SEGMENT_ORDER.indexOf(outcome);
  if (index === -1) return 0;
  const sectorCenter = index * WHEEL_CONFIG.SEGMENT_ANGLE;
  const extraSpins = WHEEL_PHYSICS.BASE_ROTATIONS * 360;
  return extraSpins + (360 - sectorCenter);
}

/** @deprecated API route compat — accepts segment index instead of outcome string */
export function getTargetAngle(targetIndex: number): number {
  const clampedIndex = Math.max(0, Math.min(targetIndex, WHEEL_CONFIG.SEGMENT_ORDER.length - 1));
  const outcome = WHEEL_CONFIG.SEGMENT_ORDER[clampedIndex];
  return getTargetRotation(outcome);
}

export function getSectorIndex(id: SpinOutcome): number {
  return WHEEL_CONFIG.SEGMENT_ORDER.indexOf(id);
}

// ---- Pointer tick timing ----

/** Tick interval (ms) as a function of elapsed time during spin */
export function getTickInterval(elapsedMs: number, spinDurationMs: number): number {
  const slowdownStart = spinDurationMs * 0.8;
  if (elapsedMs < slowdownStart) return 80;
  const t = (elapsedMs - slowdownStart) / (spinDurationMs - slowdownStart);
  return 80 + t * 420; // 80ms → 500ms
}

// ---- Visual layer depths (z-index) ----

export const Z = {
  AMBIENT_GLOW: 1,
  OUTER_RING: 2,
  WHEEL_BODY: 3,
  SEGMENT_CONTENT: 4,
  ENERGY_RING: 5,
  CENTER_HUB: 6,
  NEEDLE: 10,
  PARTICLES: 40,
  REVEAL_OVERLAY: 50,
  OUTCOME_CARD: 55,
  TOKEN_FLIGHT: 60,
} as const;

// ---- Button charge animation ----

export const BUTTON_CONFIG = {
  IDLE_PULSE_DURATION: 2000,
  CHARGE_DURATION: 400,
  RIPPLE_DURATION: 600,
  COMPRESS_SCALE: 0.93,
  HOVER_SCALE: 1.04,
  SIZE: 200,
} as const;

// ---- Wheel visual layers ----

export const WHEEL_VISUAL = {
  /** Breathing idle animation period (ms) */
  IDLE_BREATHE_PERIOD: 3000,
  /** Energy ring rotation period (ms) */
  ENERGY_RING_PERIOD: 4000,
  /** Center hub glow pulse period (ms) */
  HUB_PULSE_PERIOD: 2500,
  /** Ambient reflection shift period (ms) */
  REFLECTION_PERIOD: 6000,
} as const;
