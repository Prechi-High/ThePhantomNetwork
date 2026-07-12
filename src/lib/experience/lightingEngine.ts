/**
 * Lighting Engine — Emotional Ambient Lighting
 *
 * The entire arena background reacts to gameplay events.
 * Lighting communicates emotion — not decoration.
 *
 * Lighting states:
 *   idle         → deep purple/dark
 *   spin         → warm amber glow grows
 *   reveal       → burst to match outcome colour
 *   acquire      → warm gold
 *   advance      → bright gold
 *   discover     → electric blue
 *   steal        → crimson red
 *   revive       → emerald green
 *   void         → dark violet implosion
 *   championship → bright white-gold maximum
 */

export type LightingState =
  | "idle"
  | "spin"
  | "reveal_advance"
  | "reveal_acquire"
  | "reveal_discover"
  | "reveal_steal"
  | "reveal_void"
  | "revive"
  | "championship"
  | "elimination";

interface LightingPreset {
  primary: string;
  secondary: string;
  intensity: number; // 0–1
  transitionMs: number;
  pulseMs?: number;
}

const LIGHTING_PRESETS: Record<LightingState, LightingPreset> = {
  idle: {
    primary:      "rgba(88,28,135,0.18)",
    secondary:    "rgba(49,7,70,0.12)",
    intensity:    0.3,
    transitionMs: 600,
  },
  spin: {
    primary:      "rgba(120,53,15,0.22)",
    secondary:    "rgba(88,28,135,0.2)",
    intensity:    0.5,
    transitionMs: 300,
    pulseMs:      2000,
  },
  reveal_advance: {
    primary:      "rgba(255,215,0,0.3)",
    secondary:    "rgba(245,158,11,0.15)",
    intensity:    0.9,
    transitionMs: 150,
  },
  reveal_acquire: {
    primary:      "rgba(16,185,129,0.3)",
    secondary:    "rgba(5,150,105,0.15)",
    intensity:    0.75,
    transitionMs: 150,
  },
  reveal_discover: {
    primary:      "rgba(59,130,246,0.28)",
    secondary:    "rgba(37,99,235,0.12)",
    intensity:    0.65,
    transitionMs: 200,
  },
  reveal_steal: {
    primary:      "rgba(239,68,68,0.35)",
    secondary:    "rgba(185,28,28,0.15)",
    intensity:    0.85,
    transitionMs: 100,
    pulseMs:      400,
  },
  reveal_void: {
    primary:      "rgba(30,10,40,0.6)",
    secondary:    "rgba(0,0,0,0.4)",
    intensity:    0.1,
    transitionMs: 300,
  },
  revive: {
    primary:      "rgba(34,197,94,0.25)",
    secondary:    "rgba(22,163,74,0.12)",
    intensity:    0.6,
    transitionMs: 400,
    pulseMs:      1200,
  },
  championship: {
    primary:      "rgba(255,215,0,0.4)",
    secondary:    "rgba(255,255,255,0.12)",
    intensity:    1.0,
    transitionMs: 1000,
    pulseMs:      2500,
  },
  elimination: {
    primary:      "rgba(239,68,68,0.15)",
    secondary:    "rgba(10,0,0,0.5)",
    intensity:    0.2,
    transitionMs: 800,
  },
};

// ── Lighting Engine ───────────────────────────────────────────────────────

export class LightingEngine {
  private currentState: LightingState = "idle";
  private overlayElement: HTMLElement | null = null;
  private pulseTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: LightingState, preset: LightingPreset) => void> = new Set();

  mount(overlay: HTMLElement): void {
    this.overlayElement = overlay;
    this.applyPreset(LIGHTING_PRESETS.idle, 600);
  }

  unmount(): void {
    this.stopPulse();
    this.overlayElement = null;
    this.listeners.clear();
  }

  transition(state: LightingState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    const preset = LIGHTING_PRESETS[state];
    this.stopPulse();
    this.applyPreset(preset, preset.transitionMs);

    if (preset.pulseMs) this.startPulse(preset);

    this.listeners.forEach((fn) => fn(state, preset));
  }

  /** Restore to idle after event-based lighting completes */
  returnToIdle(delayMs = 2000): void {
    setTimeout(() => this.transition("idle"), delayMs);
  }

  onChange(fn: (state: LightingState, preset: LightingPreset) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getCurrentState(): LightingState { return this.currentState; }

  private applyPreset(preset: LightingPreset, durationMs: number): void {
    if (!this.overlayElement) return;
    this.overlayElement.style.transition = `background ${durationMs}ms ease, opacity ${durationMs}ms ease`;
    this.overlayElement.style.background = `radial-gradient(ellipse 80% 60% at 50% 40%, ${preset.primary} 0%, ${preset.secondary} 40%, transparent 70%)`;
    this.overlayElement.style.opacity = String(preset.intensity);
  }

  private startPulse(preset: LightingPreset): void {
    if (!preset.pulseMs) return;
    let dir = 1;
    this.pulseTimer = setInterval(() => {
      if (!this.overlayElement) return;
      const intensity = preset.intensity + dir * 0.08;
      this.overlayElement.style.opacity = String(Math.max(0, Math.min(1, intensity)));
      dir *= -1;
    }, preset.pulseMs / 2);
  }

  private stopPulse(): void {
    if (this.pulseTimer) { clearInterval(this.pulseTimer); this.pulseTimer = null; }
  }
}

export const lightingEngine = new LightingEngine();
