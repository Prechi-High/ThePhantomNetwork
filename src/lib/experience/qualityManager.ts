/**
 * Quality Manager — Device-Tier Visual Scaling
 *
 * Automatically scales visual effects to device capability.
 * No gameplay differences — only presentation changes.
 *
 * Tiers:
 *   ultra  — full effects, 60fps target
 *   high   — full effects, minor optimisations
 *   medium — reduced particles, no blur
 *   low    — minimal particles, no glow/shadows
 *   minimal — accessibility / reduced-motion mode
 *
 * Detection strategy:
 *   1. prefers-reduced-motion → always minimal
 *   2. deviceMemory < 2GB     → low
 *   3. hardwareConcurrency ≤ 2 → medium
 *   4. Otherwise             → high / ultra via FPS probe
 */

export type QualityTier = "ultra" | "high" | "medium" | "low" | "minimal";

export interface QualityProfile {
  tier: QualityTier;
  particleMultiplier: number;  // 0–1
  blurEnabled:        boolean;
  glowEnabled:        boolean;
  shadowsEnabled:     boolean;
  lightingEnabled:    boolean;
  cameraEnabled:      boolean;
  ambientParticles:   boolean;
  screenFxEnabled:    boolean;
  targetFPS:          number;
}

const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  ultra: {
    tier: "ultra",
    particleMultiplier: 1.0,
    blurEnabled:        true,
    glowEnabled:        true,
    shadowsEnabled:     true,
    lightingEnabled:    true,
    cameraEnabled:      true,
    ambientParticles:   true,
    screenFxEnabled:    true,
    targetFPS:          60,
  },
  high: {
    tier: "high",
    particleMultiplier: 0.8,
    blurEnabled:        true,
    glowEnabled:        true,
    shadowsEnabled:     true,
    lightingEnabled:    true,
    cameraEnabled:      true,
    ambientParticles:   true,
    screenFxEnabled:    true,
    targetFPS:          60,
  },
  medium: {
    tier: "medium",
    particleMultiplier: 0.5,
    blurEnabled:        false,
    glowEnabled:        true,
    shadowsEnabled:     false,
    lightingEnabled:    true,
    cameraEnabled:      true,
    ambientParticles:   false,
    screenFxEnabled:    true,
    targetFPS:          60,
  },
  low: {
    tier: "low",
    particleMultiplier: 0.2,
    blurEnabled:        false,
    glowEnabled:        false,
    shadowsEnabled:     false,
    lightingEnabled:    false,
    cameraEnabled:      false,
    ambientParticles:   false,
    screenFxEnabled:    false,
    targetFPS:          30,
  },
  minimal: {
    tier: "minimal",
    particleMultiplier: 0.0,
    blurEnabled:        false,
    glowEnabled:        false,
    shadowsEnabled:     false,
    lightingEnabled:    false,
    cameraEnabled:      false,
    ambientParticles:   false,
    screenFxEnabled:    false,
    targetFPS:          30,
  },
};

// ── Quality Manager ───────────────────────────────────────────────────────

export class QualityManager {
  private currentTier: QualityTier = "high";
  private fpsProbeActive = false;
  private listeners: Set<(profile: QualityProfile) => void> = new Set();

  /** Detect device capability and set initial tier */
  detect(): void {
    if (typeof window === "undefined") return;

    // 1. Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.setTier("minimal");
      return;
    }

    // 2. Low memory devices
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) {
      this.setTier("low");
      return;
    }

    // 3. Low CPU core count
    if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2) {
      this.setTier("medium");
      return;
    }

    // 4. Default to high, probe FPS to determine ultra
    this.setTier("high");
    this.probeFPS();
  }

  /** Run a short FPS probe to determine if ultra is achievable */
  private probeFPS(): void {
    if (this.fpsProbeActive || typeof requestAnimationFrame === "undefined") return;
    this.fpsProbeActive = true;

    const samples: number[] = [];
    let lastTime = performance.now();
    let frames = 0;

    const probe = (time: number) => {
      const delta = time - lastTime;
      if (delta > 0) samples.push(1000 / delta);
      lastTime = time;
      frames++;

      if (frames < 60) {
        requestAnimationFrame(probe);
      } else {
        this.fpsProbeActive = false;
        const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
        if (avgFps >= 58) this.setTier("ultra");
      }
    };

    requestAnimationFrame(probe);
  }

  setTier(tier: QualityTier): void {
    this.currentTier = tier;
    const profile = this.getProfile();
    this.listeners.forEach((fn) => fn(profile));

    if (process.env.NODE_ENV === "development") {
      console.log(`[QualityManager] Tier: ${tier}`);
    }
  }

  getProfile(): QualityProfile {
    return QUALITY_PROFILES[this.currentTier];
  }

  getTier(): QualityTier { return this.currentTier; }

  onChange(fn: (profile: QualityProfile) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Returns particle count respecting quality tier */
  scaleParticleCount(base: number): number {
    return Math.round(base * this.getProfile().particleMultiplier);
  }
}

export const qualityManager = new QualityManager();
