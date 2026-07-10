/**
 * Premium Spin Wheel Configuration
 * Centralized timing and animation constants for the cinematic spin wheel system
 */

import type { SpinOutcome } from "@/types/gameplay";

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const SPIN_TIMINGS = {
  /** Total spin duration (6 seconds) */
  SPIN_DURATION: 6000,
  
  /** Initial impulse phase */
  IMPULSE_DURATION: 300,
  
  /** High-speed spinning phase */
  FAST_SPIN_START: 300,
  FAST_SPIN_END: 4800,
  
  /** Progressive slowdown phase */
  SLOWDOWN_START: 4800,
  SLOWDOWN_END: 5600,
  
  /** Final precise stop */
  STOP_START: 5600,
  STOP_END: 6000,
  
  /** Reveal sequence (3 seconds total) */
  REVEAL_DURATION: 3000,
  REVEAL_PAUSE: 300,
  REVEAL_ENERGY_START: 800,
  REVEAL_BURST: 1100,
  REVEAL_FLASH: 1300,
  REVEAL_CARD_APPEAR: 1500,
  REVEAL_PARTICLES_END: 3000,
  
  /** Token collection animation */
  TOKEN_FLY_DURATION: 1000,
  TOKEN_INCREMENT_DELAY: 100,
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
    cardTitle: '+3 TOKENS',
    cardSubtitle: 'Momentum Increased',
    icon: '👑',
    soundType: 'legendary',
    cameraShake: 'strong',
  },
  ACQUIRE: {
    primary: '#10B981',      // Emerald
    accent: '#34D399',
    glow: 'rgba(16, 185, 129, 0.5)',
    glowStrength: 'medium',
    particles: ['green-crystals', 'floating-fragments'],
    cardTitle: '+1 TOKEN',
    cardSubtitle: 'Resources Secured',
    icon: '💎',
    soundType: 'reward',
    cameraShake: 'medium',
  },
  DISCOVER: {
    primary: '#3B82F6',      // Blue
    accent: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.4)',
    glowStrength: 'soft',
    particles: ['floating-energy', 'small-sparks'],
    cardTitle: '+0.5 TOKEN',
    cardSubtitle: 'Hidden Opportunity',
    icon: '✨',
    soundType: 'magical',
    cameraShake: 'subtle',
  },
  STEAL: {
    primary: '#EF4444',      // Red
    accent: '#991B1B',       // Dark crimson
    glow: 'rgba(239, 68, 68, 0.5)',
    glowStrength: 'strong',
    particles: ['smoke', 'red-streaks', 'sharp-lines'],
    cardTitle: 'STEAL READY',
    cardSubtitle: 'Choose Your Target',
    icon: '🗡️',
    soundType: 'sharp',
    cameraShake: 'strong',
  },
  VOID: {
    primary: '#6B7280',      // Gray
    accent: '#374151',       // Dark charcoal
    glow: 'rgba(107, 114, 128, 0.3)',
    glowStrength: 'soft',
    particles: ['dust', 'smoke', 'fading-particles'],
    cardTitle: 'VOID',
    cardSubtitle: 'No Opportunity Found',
    icon: '💨',
    soundType: 'empty',
    cameraShake: 'none',
  },
};

// ============================================================================
// WHEEL STRUCTURE
// ============================================================================

export const WHEEL_CONFIG = {
  /** Number of segments (MUST be 5) */
  SEGMENTS: 5,
  
  /** Degrees per segment */
  SEGMENT_ANGLE: 72,
  
  /** Segment order on wheel */
  SEGMENT_ORDER: ['ADVANCE', 'DISCOVER', 'ACQUIRE', 'VOID', 'STEAL'] as SpinOutcome[],
  
  /** Base rotation speed */
  BASE_ROTATION_SPEED: 360 * 5, // 5 full rotations
  
  /** Camera zoom during spin */
  CAMERA_ZOOM_SCALE: 1.05,
  
  /** Screen darken opacity */
  DARKEN_OPACITY: 0.3,
} as const;

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const EASING = {
  /** Smooth start with acceleration */
  SPIN_START: [0.25, 0.1, 0.25, 1] as const,
  
  /** Natural deceleration with tiny bounce */
  SPIN_END: [0.15, 0.85, 0.3, 1.02] as const,
  
  /** Reveal card entrance */
  REVEAL_ENTRANCE: [0.34, 1.56, 0.64, 1] as const,
  
  /** Token fly curve */
  TOKEN_CURVE: [0.42, 0, 0.58, 1] as const,
} as const;

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

export const PARTICLE_CONFIG = {
  /** Maximum particles per effect */
  MAX_PARTICLES: 50,
  
  /** Particle lifetime (ms) */
  PARTICLE_LIFETIME: 2000,
  
  /** GPU optimization */
  USE_TRANSFORM: true,
  USE_WILL_CHANGE: true,
} as const;

// ============================================================================
// AUDIO
// ============================================================================

export const AUDIO_CONFIG = {
  VOLUME: {
    SPIN_START: 0.7,
    SPIN_LOOP: 0.4,
    SPIN_STOP: 0.8,
    REVEAL: 0.9,
    TOKEN_COLLECT: 0.5,
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

// ============================================================================
// PERFORMANCE
// ============================================================================

export const PERFORMANCE_CONFIG = {
  /** Target frame rate */
  TARGET_FPS: 60,
  
  /** Enable GPU acceleration */
  GPU_ACCELERATION: true,
  
  /** Preload assets */
  PRELOAD_ASSETS: true,
  
  /** Optimize for mobile */
  MOBILE_OPTIMIZED: true,
} as const;
