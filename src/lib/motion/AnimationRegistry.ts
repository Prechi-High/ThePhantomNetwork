/**
 * AnimationRegistry — code-only motion definitions
 */

import type { FramerVariantsDef, MotionAnimationDef, MotionState } from "./types";

export const FRAMER_PRESETS: Record<string, FramerVariantsDef> = {
  buttonHover: {
    hover: { scale: 1.03, y: -2, boxShadow: "0 0 20px rgba(139,92,246,0.5)" },
    tap: { scale: 0.96, y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 22 },
  },
  cardFloat: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  cardHover: {
    hover: { y: -6, scale: 1.02 },
    transition: { type: "spring", stiffness: 350, damping: 24 },
  },
  countdownPulse: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: [0.5, 1.15, 1], opacity: [0, 1, 0.9] },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  guardianShield: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: "backOut" },
  },
};

export const ANIMATION_REGISTRY: Record<string, MotionAnimationDef> = {
  wheel_spin: {
    id: "wheel_spin",
    gsapPreset: "wheelSpin",
    pauseOffscreen: true,
  },
  wheel_glow: {
    id: "wheel_glow",
    cssKeyframes: "wheelGlowPulse",
    pauseOffscreen: true,
  },
  reveal_burst: {
    id: "reveal_burst",
    gsapPreset: "revealBurst",
    svgLayer: "shockwave",
  },
  advance_rays: {
    id: "advance_rays",
    svgLayer: "goldenRays",
    framer: { animate: { opacity: [0, 1, 0.6] }, transition: { duration: 1.2 } },
  },
  discover_ripple: {
    id: "discover_ripple",
    svgLayer: "blueRipple",
    framer: { animate: { scale: [0.5, 2], opacity: [0.8, 0] }, transition: { duration: 1 } },
  },
  acquire_burst: {
    id: "acquire_burst",
    gsapPreset: "coinBurst",
  },
  void_collapse: {
    id: "void_collapse",
    gsapPreset: "voidCollapse",
    cssKeyframes: "voidDesaturate",
  },
  steal_slash: {
    id: "steal_slash",
    svgLayer: "shadowSlash",
    gsapPreset: "stealSlash",
  },
  guardian: {
    id: "guardian",
    svgLayer: "hexShield",
    framer: FRAMER_PRESETS.guardianShield,
  },
  cloak: {
    id: "cloak",
    gsapPreset: "cloakFade",
    cssKeyframes: "cloakDistort",
  },
  insurance: {
    id: "insurance",
    framer: { animate: { scale: [1, 1.05, 1] }, transition: { duration: 0.8, repeat: 3 } },
  },
  revive: {
    id: "revive",
    gsapPreset: "reviveRebuild",
  },
  countdown: {
    id: "countdown",
    framer: FRAMER_PRESETS.countdownPulse,
  },
  victory: {
    id: "victory",
    gsapPreset: "victoryBurst",
    svgLayer: "goldenRays",
  },
  button: {
    id: "button",
    framer: FRAMER_PRESETS.buttonHover,
  },
  card: {
    id: "card",
    framer: FRAMER_PRESETS.cardFloat,
  },
};

export function getAnimationDef(id: string): MotionAnimationDef | undefined {
  return ANIMATION_REGISTRY[id];
}

export function resolveMotionForState(state: MotionState): string | undefined {
  const map: Partial<Record<MotionState, string>> = {
    SpinStart: "wheel_spin",
    Spinning: "wheel_glow",
    RewardReveal: "reveal_burst",
    Advance: "advance_rays",
    Discover: "discover_ripple",
    Acquire: "acquire_burst",
    Void: "void_collapse",
    Steal: "steal_slash",
    GuardianActivated: "guardian",
    Cloak: "cloak",
    Insurance: "insurance",
    Revive: "revive",
    Countdown: "countdown",
    CountdownGo: "victory",
    Victory: "victory",
  };
  return map[state];
}
