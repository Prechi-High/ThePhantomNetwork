/**
 * Legacy V6 Motion Engine — shared types
 */

import type { TargetAndTransition, Transition } from "framer-motion";

export type MotionState =
  | "Idle"
  | "SpinStart"
  | "Spinning"
  | "SpinSlowdown"
  | "RewardReveal"
  | "Advance"
  | "Acquire"
  | "Discover"
  | "Steal"
  | "Void"
  | "GuardianActivated"
  | "GuardianIdle"
  | "GuardianExpired"
  | "StealBoost"
  | "Cloak"
  | "Insurance"
  | "Revive"
  | "Elimination"
  | "MatchFound"
  | "Countdown"
  | "CountdownGo"
  | "Victory";

export type ScreenId =
  | "home"
  | "shop"
  | "profile"
  | "camp"
  | "squad"
  | "leaderboard"
  | "world"
  | "play"
  | "results"
  | "countdown";

export type AudioCategory =
  | "ambient"
  | "ui"
  | "gameplay"
  | "rewards"
  | "combat"
  | "countdown"
  | "victory"
  | "transitions";

export type AudioChannel = "ambient" | "gameplay" | "ui" | "music" | "voice";

export type LegacyAudioLayer =
  | "ambient"
  | "mechanical"
  | "combat"
  | "ui"
  | "reward"
  | "music"
  | "voice"
  | "environment";

export interface AudioCueDef {
  id: string;
  path: string;
  channel: AudioChannel;
  category: AudioCategory;
  legacyLayer: LegacyAudioLayer;
  volume: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  pitchVariance?: number;
  volumeVariance?: number;
}

export type AudioEnterAction =
  | { play: string; volume?: number }
  | { stop: string; fadeOut?: number };

export type AudioExitAction = { stop: string; fadeOut?: number };

export interface AudioStateProfile {
  enter: AudioEnterAction[];
  exit: AudioExitAction[];
}

export interface FramerVariantsDef {
  initial?: TargetAndTransition | boolean;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  hover?: TargetAndTransition;
  tap?: TargetAndTransition;
  transition?: Transition;
}

export interface MotionAnimationDef {
  id: string;
  framer?: FramerVariantsDef;
  cssKeyframes?: string;
  gsapPreset?: string;
  svgLayer?: string;
  pauseOffscreen?: boolean;
}

export interface ParticlePresetDef {
  id: string;
  engine: "tsparticles" | "canvas";
  preset: string;
  density?: number;
  colors?: string[];
}

export type VisualFxType =
  | "glow"
  | "blur"
  | "shockwave"
  | "lightning"
  | "desaturate"
  | "motionBlur"
  | "pulse"
  | "shield"
  | "slash";

export interface EffectDef {
  id: string;
  state?: MotionState;
  motion?: string;
  particles?: string[];
  sounds?: string[];
  visualFx?: VisualFxType[];
  haptic?: string;
  screenFx?: string;
}

export type PlayEffectInput = string | EffectDef;

export interface MotionStateChangeEvent {
  from: MotionState | null;
  to: MotionState;
  timestamp: number;
}

export type MotionStateListener = (event: MotionStateChangeEvent) => void;

export interface MotionSlotBinding {
  motionId: string;
  playVariant?: (variant: string) => void;
  pause?: () => void;
  resume?: () => void;
}

export interface ScreenAmbienceDef {
  screen: ScreenId;
  particles: string[];
  audio: string[];
  visualFx?: VisualFxType[];
}
