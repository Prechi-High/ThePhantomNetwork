/**
 * Particle Orchestrator — Reusable Particle Type System
 *
 * Instead of every component owning its own particles,
 * all particles come from this shared library.
 * Huge memory optimization — types are pooled, not recreated.
 *
 * Particle types:
 *   spark    — small bright flashes
 *   dust     — soft ambient particles
 *   glow     — pulsing light orbs
 *   smoke    — soft expanding clouds
 *   fire     — rising flame particles
 *   coin     — token reward particles
 *   lightning — sharp energy streaks
 *   energy   — flowing energy wisps
 *   ripple   — expanding ring effects
 */

export type ParticleType =
  | "spark"
  | "dust"
  | "glow"
  | "smoke"
  | "fire"
  | "coin"
  | "lightning"
  | "energy"
  | "ripple";

export interface ParticleConfig {
  type: ParticleType;
  count: number;
  color: string;
  glowColor?: string;
  /** Particle size range [min, max] px */
  size: [number, number];
  /** Lifetime ms */
  lifetime: number;
  /** Velocity units — how far they travel */
  velocity: number;
  /** Gravity coefficient (0 = float, positive = fall, negative = rise) */
  gravity: number;
  /** Origin: "center" | "wheel" | "hud" | absolute position */
  origin: "center" | "wheel" | "hud" | { x: number; y: number };
}

export interface ParticleBurst {
  id: string;
  config: ParticleConfig;
  startedAt: number;
  qualityMultiplier: number;
}

// ── Preset library ────────────────────────────────────────────────────────

export const PARTICLE_LIBRARY: Record<string, ParticleConfig> = {
  // ADVANCE — golden energy shards rising
  advance_burst: {
    type: "spark",
    count: 80,
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.6)",
    size: [3, 9],
    lifetime: 1800,
    velocity: 12,
    gravity: -0.05,
    origin: "center",
  },

  // ACQUIRE — emerald coins orbiting
  acquire_coins: {
    type: "coin",
    count: 50,
    color: "#10B981",
    glowColor: "rgba(16,185,129,0.5)",
    size: [5, 11],
    lifetime: 2000,
    velocity: 8,
    gravity: 0.1,
    origin: "center",
  },

  // DISCOVER — blue energy wisps
  discover_wisps: {
    type: "energy",
    count: 40,
    color: "#3B82F6",
    glowColor: "rgba(59,130,246,0.4)",
    size: [2, 6],
    lifetime: 2200,
    velocity: 6,
    gravity: -0.08,
    origin: "center",
  },

  // STEAL — red smoke + sparks
  steal_smoke: {
    type: "smoke",
    count: 20,
    color: "rgba(239,68,68,0.5)",
    size: [20, 50],
    lifetime: 2500,
    velocity: 4,
    gravity: -0.12,
    origin: "center",
  },
  steal_sparks: {
    type: "spark",
    count: 40,
    color: "#EF4444",
    glowColor: "rgba(239,68,68,0.6)",
    size: [2, 7],
    lifetime: 1200,
    velocity: 10,
    gravity: 0.15,
    origin: "center",
  },

  // VOID — dark dust implosion
  void_dust: {
    type: "dust",
    count: 30,
    color: "#374151",
    size: [3, 8],
    lifetime: 2800,
    velocity: 3,
    gravity: 0.2,
    origin: "center",
  },

  // CHAMPIONSHIP — maximum golden burst
  championship_burst: {
    type: "spark",
    count: 120,
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.8)",
    size: [4, 12],
    lifetime: 2500,
    velocity: 16,
    gravity: -0.1,
    origin: "center",
  },

  // TOKEN — tiny coin ticks
  token_tick: {
    type: "coin",
    count: 1,
    color: "#FBBF24",
    glowColor: "rgba(251,191,36,0.7)",
    size: [8, 14],
    lifetime: 1000,
    velocity: 5,
    gravity: -0.2,
    origin: "hud",
  },

  // AMBIENT — idle wheel particles
  wheel_ambient: {
    type: "dust",
    count: 8,
    color: "rgba(168,85,247,0.4)",
    size: [1, 3],
    lifetime: 3000,
    velocity: 1,
    gravity: -0.05,
    origin: "wheel",
  },

  // REVIVE — green life ripples
  revive_ripple: {
    type: "ripple",
    count: 6,
    color: "rgba(34,197,94,0.5)",
    glowColor: "rgba(34,197,94,0.3)",
    size: [40, 120],
    lifetime: 2000,
    velocity: 0,
    gravity: 0,
    origin: "center",
  },
};

// ── Orchestrator ──────────────────────────────────────────────────────────

export class ParticleOrchestrator {
  private activeBursts: Map<string, ParticleBurst> = new Map();
  private qualityMultiplier = 1.0;

  setQuality(multiplier: number): void {
    this.qualityMultiplier = Math.max(0, Math.min(1, multiplier));
  }

  emit(configKey: string, overrides?: Partial<ParticleConfig>): string | null {
    if (this.qualityMultiplier === 0) return null;

    const base = PARTICLE_LIBRARY[configKey];
    if (!base) {
      console.warn(`[ParticleOrchestrator] Unknown config: ${configKey}`);
      return null;
    }

    const config: ParticleConfig = { ...base, ...overrides };
    const burst: ParticleBurst = {
      id: `burst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      config,
      startedAt: Date.now(),
      qualityMultiplier: this.qualityMultiplier,
    };

    this.activeBursts.set(burst.id, burst);

    // Auto-remove after lifetime
    setTimeout(() => {
      this.activeBursts.delete(burst.id);
    }, config.lifetime + 200);

    return burst.id;
  }

  /** Emit multiple configs (e.g. steal = smoke + sparks) */
  emitGroup(configKeys: string[]): string[] {
    return configKeys.map((k) => this.emit(k)).filter(Boolean) as string[];
  }

  cancel(burstId: string): void {
    this.activeBursts.delete(burstId);
  }

  clearAll(): void {
    this.activeBursts.clear();
  }

  getActiveBursts(): ParticleBurst[] {
    return Array.from(this.activeBursts.values());
  }

  getQuality(): number {
    return this.qualityMultiplier;
  }
}

export const particleOrchestrator = new ParticleOrchestrator();
