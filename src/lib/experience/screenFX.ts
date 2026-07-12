/**
 * Screen FX — Full-Screen Reactive Effects
 *
 * The entire viewport becomes reactive to gameplay events.
 * All effects are CSS-based — GPU-composited, never layout-thrashing.
 * Very subtle. Never distracting.
 *
 * Effects:
 *   golden_bloom     — warm gold radial (advance/reveal)
 *   red_slash        — crimson overlay + diagonal (steal)
 *   shield_ripple    — blue expanding ring (shield)
 *   golden_sweep     — gold shield sweep (insurance)
 *   heat_distortion  — warm haze (fire boost)
 *   white_flash      — brief white burst (revive complete)
 *   dark_vignette    — edge darkness (elimination/void)
 *   championship_flare — maximum gold corona (championship)
 */

export type ScreenFXType =
  | "golden_bloom"
  | "red_slash"
  | "shield_ripple"
  | "golden_sweep"
  | "heat_distortion"
  | "white_flash"
  | "dark_vignette"
  | "championship_flare"
  | "none";

interface FXPreset {
  /** CSS background for the overlay element */
  background: string;
  /** Peak opacity */
  peakOpacity: number;
  /** Duration in ms */
  durationMs: number;
  /** Blend mode */
  mixBlendMode?: string;
}

const FX_PRESETS: Record<ScreenFXType, FXPreset> = {
  none: {
    background: "transparent",
    peakOpacity: 0,
    durationMs: 0,
  },
  golden_bloom: {
    background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,215,0,0.25) 0%, transparent 70%)",
    peakOpacity: 1,
    durationMs: 800,
  },
  red_slash: {
    background: "linear-gradient(135deg, transparent 30%, rgba(239,68,68,0.3) 50%, transparent 70%)",
    peakOpacity: 1,
    durationMs: 500,
    mixBlendMode: "screen",
  },
  shield_ripple: {
    background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(56,189,248,0.25) 60%, transparent 80%)",
    peakOpacity: 1,
    durationMs: 700,
  },
  golden_sweep: {
    background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.2) 50%, transparent 100%)",
    peakOpacity: 1,
    durationMs: 600,
  },
  heat_distortion: {
    background: "radial-gradient(ellipse 50% 50% at 50% 80%, rgba(249,115,22,0.2) 0%, transparent 70%)",
    peakOpacity: 1,
    durationMs: 400,
  },
  white_flash: {
    background: "rgba(255,255,255,1)",
    peakOpacity: 0.7,
    durationMs: 400,
  },
  dark_vignette: {
    background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
    peakOpacity: 1,
    durationMs: 1200,
  },
  championship_flare: {
    background: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(255,215,0,0.35) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
    peakOpacity: 1,
    durationMs: 2000,
  },
};

// ── Screen FX Controller ──────────────────────────────────────────────────

export class ScreenFXController {
  private overlayElement: HTMLElement | null = null;
  private activeTimer: ReturnType<typeof setTimeout> | null = null;

  mount(overlay: HTMLElement): void {
    this.overlayElement = overlay;
    this.overlayElement.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 45;
      opacity: 0;
      transition: opacity 0.1s ease;
    `;
  }

  unmount(): void {
    this.clear();
    this.overlayElement = null;
  }

  trigger(fx: ScreenFXType): void {
    if (!this.overlayElement || fx === "none") return;

    const preset = FX_PRESETS[fx];
    if (preset.peakOpacity === 0) return;

    this.clear();

    // Apply styles
    this.overlayElement.style.background    = preset.background;
    this.overlayElement.style.mixBlendMode  = preset.mixBlendMode ?? "normal";
    this.overlayElement.style.transition    = "opacity 80ms ease";
    this.overlayElement.style.opacity       = String(preset.peakOpacity);

    // Fade out after duration
    this.activeTimer = setTimeout(() => {
      if (!this.overlayElement) return;
      this.overlayElement.style.transition = `opacity ${preset.durationMs * 0.6}ms ease`;
      this.overlayElement.style.opacity    = "0";
    }, preset.durationMs * 0.4);
  }

  clear(): void {
    if (this.activeTimer) { clearTimeout(this.activeTimer); this.activeTimer = null; }
    if (this.overlayElement) {
      this.overlayElement.style.opacity    = "0";
      this.overlayElement.style.transition = "opacity 200ms ease";
    }
  }
}

export const screenFX = new ScreenFXController();
