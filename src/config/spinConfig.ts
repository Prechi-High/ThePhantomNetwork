/**
 * Premium Spin Wheel Configuration
 * Centralized timing and animation constants for the cinematic spin wheel system
 */

import type { SpinOutcome } from "@/types/gameplay";

// ============================================================================
// TIMING CONSTANTS (In Milliseconds)
// ============================================================================

export const SPIN_TIMINGS = {
  /** Total spin duration (6 seconds) */
  SPIN_DURATION: 6000,
  
  /** Initial impulse phase (0.0s - 0.3s) */
  IMPULSE_DURATION: 300,
  
  /** High-speed spinning phase (0.3s - 4.8s) */
  FAST_SPIN_START: 300,
  FAST_SPIN_END: 4800,
  
  /** Progressive slowdown phase (4.8s - 5.6s) */
  SLOWDOWN_START: 4800,
  SLOWDOWN_END: 5600,
  
  /** Final precise stop & needle lock (5.6s - 6.0s) */
  STOP_START: 5600,
  STOP_END: 6000,
  
  /** Reveal sequence (3 seconds total) */
  REVEAL_DURATION: 3000,
  /** 0.0s - 0.3s pause */
  REVEAL_PAUSE_END: 300,
  /** 0.3s - 0.8s energy formation */
  REVEAL_ENERGY_START: 300,
  /** 0.8s - 1.1s large light burst */
  REVEAL_BURST_START: 800,
  /** 1.1s - 1.3s screen flash */
  REVEAL_FLASH_START: 1100,
  /** 1.3s card explodes into view */
  REVEAL_CARD_EXPLODE: 1300,
  /** 1.5s animation & particles start */
  REVEAL_ANIM_START: 1500,
  
  /** Token collection animation (1 second) */
  TOKEN_FLY_DURATION: 1000,
  TOKEN_INCREMENT_DELAY: 150,
} as const;

// ============================================================================
// OUTCOME VISUAL IDENTITY
// ============================================================================

export const OUTCOME_CONFIG: Record<SpinOutcome, {
  primary: string;
  accent: string;
  glow: string;
  glowStrength: 'soft' | 'medium' | 'strong' | 'very-strong';
  particles: string[];
  cardTitle: string;
  cardSubtitle: string;
  icon: string;
  soundType: 'legendary' | 'reward' | 'magical' | 'sharp' | 'empty';
  cameraShake: 'none' | 'subtle' | 'medium' | 'strong';
}> = {
  ADVANCE: {
    primary: '#FFD700',      // Gold
    accent: '#FFFFFF',       // White
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
    primary: '#10B981',      // Emerald Green
    accent: '#A7F3D0',       // Mint
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
    primary: '#3B82F6',      // Blue
    accent: '#93C5FD',       // Light Blue
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
    primary: '#EF4444',      // Red
    accent: '#991B1B',       // Dark crimson
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
    primary: '#6B7280',      // Gray
    accent: '#374151',       // Dark charcoal
    glow: 'rgba(107, 114, 128, 0.2)',
    glowStrength: 'soft',
    particles: ['dust', 'smoke', 'fading-particles'],
    cardTitle: 'VOID',
    cardSubtitle: 'No Opportunity Found',
    icon: '💨',
    soundType: 'empty',
    cameraShake: 'subtle', // Soft pulse / subtle shake
  },
};

// ============================================================================
// WHEEL STRUCTURE
// ============================================================================

export const WHEEL_CONFIG = {
  /** Number of segments (MUST be 5) */
  SEGMENTS: 5,
  
  /** Degrees per segment (360 / 5) */
  SEGMENT_ANGLE: 72,
  
  /** Segment order on wheel clockwise starting from top (0 degrees center) */
  SEGMENT_ORDER: ['ADVANCE', 'ACQUIRE', 'STEAL', 'VOID', 'DISCOVER'] as SpinOutcome[],
  
  /** Base rotations during spin (e.g. 5 rotations) */
  BASE_ROTATIONS: 5,
  
  /** Camera zoom during spin */
  CAMERA_ZOOM_SCALE: 1.05,
  
  /** Screen darken opacity during spin */
  DARKEN_OPACITY: 0.35,
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const EASING = {
  /** Easing for the start impulse (0.0s - 0.3s) */
  IMPULSE: [0.12, 0, 0.39, 0] as const,
  
  /** Easing for high speed and deceleration with subtle bounce lock */
  SPIN_EASE: [0.25, 0.1, 0.25, 1.02] as const,
  
  /** Reveal card explosion */
  CARD_EXPLOSION: [0.34, 1.56, 0.64, 1] as const,
  
  /** Token bezier-like flight curve */
  TOKEN_FLIGHT: [0.42, 0, 0.58, 1] as const,
} as const;

// ============================================================================
// PARTICLE CONFIGURATION
// ============================================================================

export const PARTICLE_CONFIG = {
  /** Target count per outcome */
  COUNTS: {
    ADVANCE: 80,
    ACQUIRE: 50,
    DISCOVER: 40,
    STEAL: 60,
    VOID: 25,
  },
  
  /** Max lifetime (ms) */
  LIFETIME: 2000,
} as const;

// ============================================================================
// AUDIO
// ============================================================================

export const AUDIO_CONFIG = {
  VOLUME: {
    SPIN_START: 0.7,
    SPIN_LOOP: 0.45,
    SPIN_STOP: 0.8,
    REVEAL: 0.9,
    TOKEN_COLLECT: 0.6,
  },
  PATHS: {
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
  },
} as const;
