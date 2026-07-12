/**
 * Feature Flags — Production Configuration
 *
 * All gameplay features can be toggled without code changes.
 * Use for:
 *   - Gradual rollout
 *   - A/B testing
 *   - Kill switches for broken features
 *   - Platform-specific features
 *   - Debug tools in development
 *
 * Priority (highest wins):
 *   1. Environment variables (NEXT_PUBLIC_FF_*)
 *   2. URL overrides (?ff_* for development only)
 *   3. Defaults below
 */

export interface FeatureFlags {
  // ---- Gameplay ----
  /** Enable the full cinematic reveal sequence */
  cinematicReveal:        boolean;
  /** Enable full-screen particle celebrations */
  outcomeCelebrations:    boolean;
  /** Enable camera micro-reactions */
  cameraReactions:        boolean;
  /** Enable ambient lighting system */
  ambientLighting:        boolean;
  /** Enable haptic feedback on mobile */
  hapticFeedback:         boolean;
  /** Enable audio layer system */
  audioEnabled:           boolean;
  /** Enable dynamic music intensity */
  dynamicMusic:           boolean;

  // ---- World ----
  /** Enable living world features (world timeline, camp momentum) */
  livingWorld:            boolean;
  /** Enable rivalry system */
  rivalrySystem:          boolean;
  /** Enable reputation/archetype system */
  reputationSystem:       boolean;
  /** Enable world events */
  worldEvents:            boolean;
  /** Enable return experience summary */
  returnSummary:          boolean;

  // ---- Performance ----
  /** Enable performance monitoring (dev only) */
  performanceMonitor:     boolean;
  /** Enable FPS-based quality auto-detection */
  autoQualityDetection:   boolean;
  /** Maximum particle count override (0 = use default) */
  maxParticleOverride:    number;

  // ---- Debug (dev only) ----
  /** Show HUD Studio in production */
  hudStudio:              boolean;
  /** Show experience engine debug overlay */
  experienceDebug:        boolean;
  /** Log all gameplay events to console */
  debugEvents:            boolean;
  /** Bypass spin cooldown (testing only) */
  bypassSpinCooldown:     boolean;
}

// ── Default values ────────────────────────────────────────────────────────

const DEFAULTS: FeatureFlags = {
  // Gameplay
  cinematicReveal:        true,
  outcomeCelebrations:    true,
  cameraReactions:        true,
  ambientLighting:        true,
  hapticFeedback:         true,
  audioEnabled:           true,
  dynamicMusic:           true,

  // World
  livingWorld:            true,
  rivalrySystem:          true,
  reputationSystem:       true,
  worldEvents:            true,
  returnSummary:          true,

  // Performance
  performanceMonitor:     process.env.NODE_ENV === "development",
  autoQualityDetection:   true,
  maxParticleOverride:    0,

  // Debug
  hudStudio:              process.env.NODE_ENV === "development",
  experienceDebug:        false,
  debugEvents:            process.env.NODE_ENV === "development",
  bypassSpinCooldown:     false,
};

// ── Read from environment variables ──────────────────────────────────────

function readEnvFlags(): Partial<FeatureFlags> {
  if (typeof process === "undefined") return {};
  const env = process.env;
  const overrides: Partial<FeatureFlags> = {};

  const boolFlag = (key: keyof FeatureFlags, envKey: string) => {
    const val = env[envKey];
    if (val === "true")  (overrides[key] as boolean) = true;
    if (val === "false") (overrides[key] as boolean) = false;
  };

  boolFlag("cinematicReveal",     "NEXT_PUBLIC_FF_CINEMATIC_REVEAL");
  boolFlag("outcomeCelebrations", "NEXT_PUBLIC_FF_CELEBRATIONS");
  boolFlag("audioEnabled",        "NEXT_PUBLIC_FF_AUDIO");
  boolFlag("livingWorld",         "NEXT_PUBLIC_FF_LIVING_WORLD");
  boolFlag("hudStudio",           "NEXT_PUBLIC_FF_HUD_STUDIO");
  boolFlag("bypassSpinCooldown",  "NEXT_PUBLIC_FF_BYPASS_COOLDOWN");

  return overrides;
}

// ── Feature flag singleton ────────────────────────────────────────────────

class FeatureFlagManager {
  private flags: FeatureFlags = { ...DEFAULTS, ...readEnvFlags() };
  private overrides: Partial<FeatureFlags> = {};
  private listeners: Set<(flags: FeatureFlags) => void> = new Set();

  get<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
    if (key in this.overrides) return this.overrides[key] as FeatureFlags[K];
    return this.flags[key];
  }

  /** Apply a runtime override (e.g. from A/B test response) */
  override(key: keyof FeatureFlags, value: FeatureFlags[typeof key]): void {
    (this.overrides[key] as FeatureFlags[typeof key]) = value;
    this.listeners.forEach((fn) => fn(this.getAll()));
  }

  /** Reset a specific override back to default */
  reset(key: keyof FeatureFlags): void {
    delete this.overrides[key];
  }

  getAll(): FeatureFlags {
    return { ...this.flags, ...this.overrides };
  }

  onChange(fn: (flags: FeatureFlags) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const featureFlags = new FeatureFlagManager();

/** Convenience shorthand */
export const FF = (key: keyof FeatureFlags) => featureFlags.get(key);
