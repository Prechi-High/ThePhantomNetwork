/**
 * Motion Language — The Universal Animation Vocabulary
 *
 * Every animation in THE PHANTOM belongs to a semantic category.
 * Nothing animates randomly. Every motion communicates meaning.
 *
 * Categories:
 *   positive   → expand, rise, glow, rotate forward
 *   negative   → collapse, fade, darken, rotate back
 *   danger     → shake, pulse, flash
 *   information → slide, fade, float
 *   live       → drift, flow, ripple
 */

export type MotionCategory =
  | "positive"
  | "negative"
  | "danger"
  | "information"
  | "live"
  | "idle";

export type EasingCurve = [number, number, number, number];

// ── Easing catalogue ──────────────────────────────────────────────────────

export const EASING: Record<string, EasingCurve> = {
  // Positive — energetic entrance
  SPRING_OUT:   [0.34, 1.56, 0.64, 1.0],
  EASE_OUT:     [0.0,  0.0,  0.2,  1.0],
  // Negative — deliberate exit
  EASE_IN:      [0.4,  0.0,  1.0,  1.0],
  EASE_IN_OUT:  [0.4,  0.0,  0.2,  1.0],
  // Danger — sharp snap
  SHARP:        [0.0,  0.0,  0.0,  1.0],
  // Information — smooth flow
  GENTLE:       [0.25, 0.1,  0.25, 1.0],
  // Live — organic drift
  ORGANIC:      [0.45, 0.05, 0.55, 0.95],
};

// ── Motion preset per gameplay event ──────────────────────────────────────

export type GameplayEventMotion =
  | "engage"
  | "spin"
  | "reveal"
  | "acquire"
  | "advance"
  | "discover"
  | "steal"
  | "revive"
  | "void"
  | "championship"
  | "elimination"
  | "token_collect"
  | "rank_up"
  | "shield_activate"
  | "hud_update";

export interface MotionPreset {
  category: MotionCategory;
  easing: EasingCurve;
  durationMs: number;
  /** Scale multiplier (1 = no scale) */
  scale?: [number, number];
  /** Opacity range */
  opacity?: [number, number];
  /** Y translate px */
  translateY?: [number, number];
  /** Rotation degrees */
  rotate?: [number, number];
  /** Glow color */
  glowColor?: string;
  /** Camera reaction */
  camera?: "none" | "punch" | "shake" | "zoom_in" | "zoom_out" | "wider";
  /** Haptic intensity */
  haptic?: "none" | "light" | "medium" | "heavy";
}

export const MOTION_PRESETS: Record<GameplayEventMotion, MotionPreset> = {
  engage: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 200,
    scale: [0.93, 1.08],
    haptic: "light",
    camera: "none",
  },
  spin: {
    category: "live",
    easing: EASING.ORGANIC,
    durationMs: 6000,
    camera: "punch",
    haptic: "none",
  },
  reveal: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 3000,
    scale: [0.3, 1.0],
    opacity: [0, 1],
    camera: "punch",
    haptic: "heavy",
    glowColor: "#FFD700",
  },
  acquire: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 800,
    scale: [0.8, 1.05],
    translateY: [20, 0],
    glowColor: "#10B981",
    camera: "punch",
    haptic: "medium",
  },
  advance: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 900,
    scale: [0.7, 1.1],
    translateY: [30, 0],
    glowColor: "#FFD700",
    camera: "punch",
    haptic: "heavy",
  },
  discover: {
    category: "information",
    easing: EASING.GENTLE,
    durationMs: 700,
    scale: [0.9, 1.02],
    opacity: [0, 1],
    glowColor: "#3B82F6",
    camera: "none",
    haptic: "light",
  },
  steal: {
    category: "danger",
    easing: EASING.SHARP,
    durationMs: 600,
    rotate: [-3, 0],
    glowColor: "#EF4444",
    camera: "shake",
    haptic: "heavy",
  },
  revive: {
    category: "positive",
    easing: EASING.EASE_OUT,
    durationMs: 1200,
    scale: [0.5, 1.0],
    opacity: [0, 1],
    glowColor: "#22C55E",
    camera: "zoom_out",
    haptic: "medium",
  },
  void: {
    category: "negative",
    easing: EASING.EASE_IN,
    durationMs: 500,
    opacity: [1, 0.6],
    scale: [1, 0.98],
    camera: "none",
    haptic: "light",
  },
  championship: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 1500,
    scale: [0.8, 1.06],
    glowColor: "#FFD700",
    camera: "wider",
    haptic: "heavy",
  },
  elimination: {
    category: "negative",
    easing: EASING.EASE_IN,
    durationMs: 1000,
    opacity: [1, 0],
    scale: [1, 0.85],
    camera: "none",
    haptic: "medium",
  },
  token_collect: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 350,
    scale: [1, 1.15],
    glowColor: "#FBBF24",
    camera: "none",
    haptic: "light",
  },
  rank_up: {
    category: "positive",
    easing: EASING.SPRING_OUT,
    durationMs: 600,
    translateY: [0, -8],
    glowColor: "#C084FC",
    camera: "none",
    haptic: "medium",
  },
  shield_activate: {
    category: "information",
    easing: EASING.EASE_OUT,
    durationMs: 500,
    scale: [1, 1.08],
    glowColor: "#38BDF8",
    camera: "none",
    haptic: "light",
  },
  hud_update: {
    category: "information",
    easing: EASING.GENTLE,
    durationMs: 300,
    translateY: [-6, 0],
    opacity: [0, 1],
    camera: "none",
    haptic: "none",
  },
};

/** Get motion preset — falls back to hud_update for unknown events */
export function getMotionPreset(event: string): MotionPreset {
  return MOTION_PRESETS[event as GameplayEventMotion] ?? MOTION_PRESETS.hud_update;
}
