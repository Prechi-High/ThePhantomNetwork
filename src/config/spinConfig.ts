/**
 * ============================================================================
 * THE PHANTOM NETWORK — MASTER GAMEPLAY CONFIGURATION
 * ============================================================================
 *
 * This is the single source of tuning truth for all gameplay physics,
 * timings, effects, audio cues, and quality profiles.
 *
 * Rules:
 *  - No magic numbers in components. Everything references this file.
 *  - Changing a value here changes behaviour everywhere.
 *  - Quality profiles are device-tier overrides, not component logic.
 *
 * Sections:
 *   1.  Wheel Physics
 *   2.  Spin Timings
 *   3.  Reveal Timings
 *   4.  Token Collection Timings
 *   5.  Wheel Structure
 *   6.  Easing Curves
 *   7.  Camera & Screen FX
 *   8.  Particle Configuration
 *   9.  Audio Timings & Paths
 *  10.  Outcome Visual Identity
 *  11.  Quality Profiles
 *  12.  Feature Flags
 *  13.  Session / Phase Timings
 * ============================================================================
 */

import type { SpinOutcome, OutcomeVisual } from '@/types/gameplay';

// ============================================================================
// 1. WHEEL PHYSICS
// ============================================================================

export const WHEEL_PHYSICS = {
  /** Number of full rotations the wheel completes before slowing */
  BASE_ROTATIONS: 5,

  /** Additional rotations added by the outcome angle calculation */
  EXTRA_ROTATION_BUFFER: 2,

  /** Acceleration curve — cubic-bezier handle for impulse phase */
  ACCELERATION_CURVE: [0.12, 0.0, 0.39, 0.0] as const,

  /** Maximum angular velocity (degrees/frame at 60fps) */
  MAX_ANGULAR_VELOCITY: 72,

  /** Deceleration curve — feels like brakes being applied */
  DECELERATION_CURVE: [0.25, 0.1, 0.25, 1.02] as const,

  /** Resistance felt by the needle as wheel slows */
  POINTER_RESISTANCE: 0.85,

  /** Micro-bounce intensity when needle snaps to final position */
  BOUNCE_INTENSITY: 0.04,

  /** Angle (degrees) at which the wheel is considered "settled" */
  SETTLING_TOLERANCE: 0.5,
} as const;

// ============================================================================
// 2. SPIN TIMINGS  (all values in milliseconds)
// ============================================================================

export const SPIN_TIMINGS = {
  /** Total spin animation duration */
  SPIN_DURATION: 6000,

  // — Acceleration —
  /** Impulse phase start */
  IMPULSE_START: 0,
  /** Impulse phase end — wheel has reached full speed */
  IMPULSE_DURATION: 300,

  // — High-speed cruise —
  FAST_SPIN_START: 300,
  FAST_SPIN_END: 4800,

  // — Deceleration —
  SLOWDOWN_START: 4800,
  SLOWDOWN_END: 5600,

  // — Final lock —
  STOP_START: 5600,
  STOP_END: 6000,

  /** Delay between button press and wheel visually starting */
  PRE_SPIN_DELAY: 150,

  /** Minimum time between two consecutive spins */
  SPIN_COOLDOWN: 500,

  // ---- Legacy aliases — keys used by existing components ----
  /** @deprecated Use REVEAL_TIMINGS.ENERGY_FORMATION_START */
  REVEAL_ENERGY_START: 300,
  /** @deprecated Use REVEAL_TIMINGS.LIGHT_BURST_START */
  REVEAL_BURST_START: 800,
  /** @deprecated Use REVEAL_TIMINGS.SCREEN_FLASH_START */
  REVEAL_FLASH_START: 1100,
  /** @deprecated Use REVEAL_TIMINGS.CARD_ENTRY_START */
  REVEAL_CARD_EXPLODE: 1300,
  /** @deprecated Use REVEAL_TIMINGS.PARTICLES_START */
  REVEAL_ANIM_START: 1500,
  /** @deprecated Use REVEAL_TIMINGS.SUSPENSE_PAUSE */
  REVEAL_PAUSE_END: 300,
  /** @deprecated Use REVEAL_TIMINGS.REVEAL_DURATION */
  REVEAL_DURATION: 3000,
  /** @deprecated Use TOKEN_TIMINGS.TOKEN_FLY_DURATION */
  TOKEN_FLY_DURATION: 1000,
  /** @deprecated Use TOKEN_TIMINGS.TOKEN_INCREMENT_DELAY */
  TOKEN_INCREMENT_DELAY: 150,
} as const;

// ============================================================================
// 3. REVEAL TIMINGS  (ms, relative to reveal sequence start)
// ============================================================================

export const REVEAL_TIMINGS = {
  /** Total reveal sequence duration */
  REVEAL_DURATION: 3000,

  /** Initial silence after wheel stops — build tension */
  SUSPENSE_PAUSE: 300,

  /** Golden energy forms around the locked segment */
  ENERGY_FORMATION_START: 300,
  ENERGY_FORMATION_END: 800,

  /** Large light burst erupts from segment */
  LIGHT_BURST_START: 800,
  LIGHT_BURST_END: 1100,

  /** Full-screen flash */
  SCREEN_FLASH_START: 1100,
  SCREEN_FLASH_END: 1200,

  /** Outcome card explodes into view */
  CARD_ENTRY_START: 1300,
  CARD_ENTRY_END: 1600,

  /** Particles and ambient animations begin */
  PARTICLES_START: 1500,

  /** HUD reacts to outcome */
  HUD_REACT_START: 1800,

  /** Outcome card settles — player can read result */
  OUTCOME_SETTLED_AT: 2000,

  /** Reveal sequence complete — move to token collection */
  REVEAL_COMPLETE_AT: 3000,
} as const;

// ============================================================================
// 4. TOKEN COLLECTION TIMINGS  (ms)
// ============================================================================

export const TOKEN_TIMINGS = {
  /** Duration of a single token flying to the counter */
  TOKEN_FLY_DURATION: 1000,

  /** Delay between each successive token in a burst */
  TOKEN_INCREMENT_DELAY: 150,

  /** How long the counter glows after receiving tokens */
  COUNTER_GLOW_DURATION: 600,

  /** Delay before token collection animation starts (after reveal) */
  COLLECTION_START_DELAY: 500,
} as const;

// ============================================================================
// 5. WHEEL STRUCTURE
// ============================================================================

export const WHEEL_CONFIG = {
  /** Must be 5 — one per outcome */
  SEGMENTS: 5,

  /** 360 / 5 = 72 degrees per segment */
  SEGMENT_ANGLE: 72,

  /** Clockwise order starting from top-center (0°) */
  SEGMENT_ORDER: ['ADVANCE', 'ACQUIRE', 'STEAL', 'VOID', 'DISCOVER'] as SpinOutcome[],

  // ---- Legacy aliases used by existing components ----
  /** @deprecated Use CAMERA_FX.SPIN_ZOOM_SCALE */
  CAMERA_ZOOM_SCALE: 1.05,
  /** @deprecated Use CAMERA_FX.SPIN_DARKEN_OPACITY */
  DARKEN_OPACITY: 0.35,
  /** @deprecated Use WHEEL_PHYSICS.BASE_ROTATIONS */
  BASE_ROTATIONS: 5,
} as const;

// ============================================================================
// 6. EASING CURVES  (CSS/Framer Motion cubic-bezier format)
// ============================================================================

export const EASING = {
  /** Button press compression */
  BUTTON_PRESS: [0.34, 1.56, 0.64, 1] as const,

  /** Wheel impulse — fast snap to speed */
  IMPULSE: [0.12, 0.0, 0.39, 0.0] as const,

  /** General deceleration with micro-overshoot */
  SPIN_EASE: [0.25, 0.1, 0.25, 1.02] as const,

  /** Outcome card explosion entrance */
  CARD_EXPLOSION: [0.34, 1.56, 0.64, 1] as const,

  /** Token bezier flight path */
  TOKEN_FLIGHT: [0.42, 0.0, 0.58, 1.0] as const,

  /** HUD settle after update */
  HUD_SETTLE: [0.22, 1.0, 0.36, 1.0] as const,

  /** Standard UI ease-out */
  EASE_OUT: [0.0, 0.0, 0.2, 1.0] as const,

  /** Standard UI ease-in-out */
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1.0] as const,
} as const;

// ============================================================================
// 7. CAMERA & SCREEN FX
// ============================================================================

export const CAMERA_FX = {
  /** Subtle zoom applied while wheel is spinning */
  SPIN_ZOOM_SCALE: 1.05,

  /** Background darkening during spin (0–1 opacity) */
  SPIN_DARKEN_OPACITY: 0.35,

  /** Camera shake intensity per outcome */
  SHAKE_INTENSITY: {
    none: 0,
    subtle: 2,
    medium: 5,
    strong: 10,
  } as const,

  /** Shake duration (ms) */
  SHAKE_DURATION: 400,

  /** Screen flash white opacity peak */
  FLASH_PEAK_OPACITY: 0.85,

  /** Screen flash fade duration (ms) */
  FLASH_FADE_DURATION: 200,
} as const;

// ============================================================================
// 8. PARTICLE CONFIGURATION
// ============================================================================

export const PARTICLE_CONFIG = {
  /** Particle count per outcome */
  COUNTS: {
    ADVANCE: 80,
    ACQUIRE: 50,
    DISCOVER: 40,
    STEAL: 60,
    VOID: 25,
  } as Record<SpinOutcome, number>,

  /** Particle max lifetime (ms) */
  LIFETIME: 2000,

  /** Gravity coefficient applied to particles */
  GRAVITY: 0.15,

  /** Initial velocity spread (px/frame) */
  VELOCITY_SPREAD: 8,

  /** Particle size range (px) */
  SIZE_MIN: 4,
  SIZE_MAX: 12,
} as const;

// ============================================================================
// OUTCOME CATEGORIES (convenience map — mirrors types/gameplay.ts)
// ============================================================================

export const OUTCOME_CATEGORIES: Record<SpinOutcome, 'positive' | 'neutral' | 'combat' | 'empty'> = {
  ADVANCE: 'positive',
  ACQUIRE: 'positive',
  DISCOVER: 'neutral',
  STEAL: 'combat',
  VOID: 'empty',
} as const;

// ============================================================================
// 9. AUDIO TIMINGS & PATHS
// ============================================================================

/** When each audio cue fires relative to the start of its phase (ms) */
export const AUDIO_TIMINGS = {
  /** Offset from SPIN_START event */
  SPIN_START_OFFSET: 0,

  /** Offset from SPIN_ACCELERATION event */
  LOOP_START_OFFSET: 200,

  /** Offset from SPIN_DECELERATION event */
  BRAKE_CUE_OFFSET: 0,

  /** Offset from SPIN_POINTER_LOCK event */
  NEEDLE_TICK_OFFSET: 0,

  /** Offset from REVEAL_STARTED event */
  REVEAL_STINGER_OFFSET: 100,

  /** Offset from OUTCOME_REVEAL event */
  OUTCOME_CUE_OFFSET: 300,

  /** Offset from TOKEN_COLLECTION_STARTED event */
  TOKEN_TICK_OFFSET: 0,
} as const;

export const AUDIO_VOLUME = {
  SPIN_START: 0.7,
  SPIN_LOOP: 0.45,
  SPIN_STOP: 0.8,
  REVEAL: 0.9,
  TOKEN_COLLECT: 0.6,
  OUTCOME_ADVANCE: 0.95,
  OUTCOME_ACQUIRE: 0.85,
  OUTCOME_DISCOVER: 0.75,
  OUTCOME_STEAL: 0.9,
  OUTCOME_VOID: 0.6,
  AMBIENT_WORLD: 0.3,
} as const;

export const AUDIO_PATHS = {
  SPIN_START: '/audio/wheel/spin-start.mp3',
  SPIN_LOOP: '/audio/wheel/spin-loop.mp3',
  SPIN_SLOWDOWN: '/audio/wheel/spin-slowdown.mp3',
  SPIN_STOP: '/audio/wheel/spin-stop.mp3',
  REVEAL_BURST: '/audio/wheel/reveal-burst.mp3',
  OUTCOME_ADVANCE: '/audio/wheel/outcome-advance.mp3',
  OUTCOME_ACQUIRE: '/audio/wheel/outcome-acquire.mp3',
  OUTCOME_DISCOVER: '/audio/wheel/outcome-discover.mp3',
  OUTCOME_STEAL: '/audio/wheel/outcome-steal.mp3',
  OUTCOME_VOID: '/audio/wheel/outcome-void.mp3',
  TOKEN_TICK: '/audio/wheel/token-tick.mp3',
  TOKENS_COMPLETE: '/audio/wheel/tokens-complete.mp3',
  AMBIENT_IDLE: '/audio/ambient/phantom-idle.mp3',
  PHASE_TRANSITION: '/audio/session/phase-transition.mp3',
} as const;

/** Unified AUDIO_CONFIG for backward compatibility */
export const AUDIO_CONFIG = {
  VOLUME: AUDIO_VOLUME,
  PATHS: AUDIO_PATHS,
} as const;

// ============================================================================
// 10. OUTCOME VISUAL IDENTITY
// ============================================================================

export const OUTCOME_CONFIG: Record<SpinOutcome, OutcomeVisual> = {
  ADVANCE: {
    primary: '#FFD700',
    accent: '#FFFFFF',
    glow: 'rgba(255, 215, 0, 0.6)',
    glowStrength: 'very-strong',
    particles: ['golden-shards', 'light-rays', 'spark-bursts'],
    cardTitle: 'ADVANCE',
    cardSubtitle: 'Momentum Increased',
    icon: '👑',
    soundType: 'legendary',
    cameraShake: 'strong',
  },
  ACQUIRE: {
    primary: '#10B981',
    accent: '#A7F3D0',
    glow: 'rgba(16, 185, 129, 0.5)',
    glowStrength: 'medium',
    particles: ['green-crystals', 'floating-fragments'],
    cardTitle: 'ACQUIRE',
    cardSubtitle: 'Resources Secured',
    icon: '💎',
    soundType: 'reward',
    cameraShake: 'medium',
  },
  DISCOVER: {
    primary: '#3B82F6',
    accent: '#93C5FD',
    glow: 'rgba(59, 130, 246, 0.4)',
    glowStrength: 'soft',
    particles: ['floating-energy', 'small-sparks'],
    cardTitle: 'DISCOVER',
    cardSubtitle: 'Hidden Opportunity',
    icon: '✨',
    soundType: 'magical',
    cameraShake: 'subtle',
  },
  STEAL: {
    primary: '#EF4444',
    accent: '#991B1B',
    glow: 'rgba(239, 68, 68, 0.6)',
    glowStrength: 'strong',
    particles: ['smoke', 'red-streaks', 'sharp-lines'],
    cardTitle: 'STEAL',
    cardSubtitle: 'Choose Your Target',
    icon: '🗡️',
    soundType: 'sharp',
    cameraShake: 'strong',
  },
  VOID: {
    primary: '#6B7280',
    accent: '#374151',
    glow: 'rgba(107, 114, 128, 0.2)',
    glowStrength: 'soft',
    particles: ['dust', 'smoke', 'fading-particles'],
    cardTitle: 'VOID',
    cardSubtitle: 'No Opportunity Found',
    icon: '🌀',
    soundType: 'empty',
    cameraShake: 'subtle',
  },
} as const;

// ============================================================================
// 11. QUALITY PROFILES
// ============================================================================

export type QualityTier = 'high' | 'medium' | 'low' | 'minimal';

export interface QualityProfile {
  particleMultiplier: number;
  shadowsEnabled: boolean;
  blurEnabled: boolean;
  cameraShakeEnabled: boolean;
  screenFlashEnabled: boolean;
  ambientParticles: boolean;
  animationFPS: 60 | 30 | 15;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    particleMultiplier: 1.0,
    shadowsEnabled: true,
    blurEnabled: true,
    cameraShakeEnabled: true,
    screenFlashEnabled: true,
    ambientParticles: true,
    animationFPS: 60,
  },
  medium: {
    particleMultiplier: 0.6,
    shadowsEnabled: true,
    blurEnabled: false,
    cameraShakeEnabled: true,
    screenFlashEnabled: true,
    ambientParticles: false,
    animationFPS: 60,
  },
  low: {
    particleMultiplier: 0.3,
    shadowsEnabled: false,
    blurEnabled: false,
    cameraShakeEnabled: false,
    screenFlashEnabled: true,
    ambientParticles: false,
    animationFPS: 30,
  },
  minimal: {
    particleMultiplier: 0.0,
    shadowsEnabled: false,
    blurEnabled: false,
    cameraShakeEnabled: false,
    screenFlashEnabled: false,
    ambientParticles: false,
    animationFPS: 15,
  },
};

/** Reduced-motion fallback — respects prefers-reduced-motion */
export const REDUCED_MOTION_PROFILE: QualityProfile = {
  particleMultiplier: 0.0,
  shadowsEnabled: false,
  blurEnabled: false,
  cameraShakeEnabled: false,
  screenFlashEnabled: false,
  ambientParticles: false,
  animationFPS: 30,
};

// ============================================================================
// 12. FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  /** Enable cinematic reveal sequence */
  CINEMATIC_REVEAL: true,

  /** Enable full-screen particle celebrations */
  OUTCOME_CELEBRATIONS: true,

  /** Enable audio engine */
  AUDIO_ENABLED: true,

  /** Enable camera shake effects */
  CAMERA_SHAKE: true,

  /** Enable token flight animations */
  TOKEN_ANIMATIONS: true,

  /** Enable live feed real-time updates */
  LIVE_FEED: true,

  /** Enable leaderboard real-time updates */
  LEADERBOARD_REALTIME: true,

  /** Log all gameplay events to console (disable in production) */
  DEBUG_EVENTS: process.env.NODE_ENV === 'development',
} as const;

// ============================================================================
// 13. SESSION / PHASE TIMINGS  (ms)
// ============================================================================

export const SESSION_TIMINGS = {
  /** Duration of the network intro animation before gameplay begins */
  NETWORK_INTRO_DURATION: 3000,

  /** Phase warning shown X ms before phase ends */
  PHASE_WARNING_THRESHOLD_MS: 30_000,

  /** Polling interval during normal gameplay */
  STATE_POLL_INTERVAL_MS: 5000,

  /** Polling interval when phase is about to end */
  STATE_POLL_INTERVAL_URGENT_MS: 2000,

  /** Debounce for realtime state updates */
  REALTIME_DEBOUNCE_MS: 200,
} as const;
