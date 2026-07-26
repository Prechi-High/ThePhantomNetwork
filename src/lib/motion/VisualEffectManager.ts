/**
 * VisualEffectManager — glow, blur, shockwave, lightning overlays
 */

import { screenFX } from "@/lib/experience/screenFX";
import type { VisualFxType } from "./types";

export class VisualEffectManager {
  private overlayEl: HTMLElement | null = null;
  private activeEffects = new Set<VisualFxType>();

  mount(el: HTMLElement): void {
    this.overlayEl = el;
    screenFX.mount(el);
  }

  unmount(): void {
    screenFX.unmount();
    this.overlayEl = null;
    this.activeEffects.clear();
  }

  trigger(fx: VisualFxType): void {
    this.activeEffects.add(fx);
    switch (fx) {
      case "glow":
        this.applyOverlay("radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", 400);
        break;
      case "blur":
        this.applyOverlay("rgba(0,0,0,0.3)", 300, "blur(4px)");
        break;
      case "shockwave":
        screenFX.trigger("white_flash");
        break;
      case "lightning":
        screenFX.trigger("championship_flare");
        break;
      case "desaturate":
        this.applyOverlay("rgba(0,0,0,0.5)", 600, "grayscale(0.8)");
        break;
      case "motionBlur":
        this.applyOverlay("transparent", 200, "blur(2px)");
        break;
      case "pulse":
        this.applyOverlay("radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 60%)", 500);
        break;
      case "shield":
        this.applyOverlay("radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 65%)", 800);
        break;
      case "slash":
        screenFX.trigger("red_slash");
        break;
      default:
        break;
    }
    setTimeout(() => this.activeEffects.delete(fx), 1000);
  }

  triggerGroup(fxs: VisualFxType[]): void {
    fxs.forEach((fx) => this.trigger(fx));
  }

  private applyOverlay(bg: string, durationMs: number, filter?: string): void {
    if (!this.overlayEl) return;
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;inset:0;pointer-events:none;z-index:9998;
      background:${bg};opacity:0;transition:opacity ${durationMs}ms ease;
      ${filter ? `backdrop-filter:${filter};` : ""}
    `;
    this.overlayEl.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = "1"; });
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), durationMs);
    }, durationMs * 0.5);
  }
}

export const visualEffectManager = new VisualEffectManager();
