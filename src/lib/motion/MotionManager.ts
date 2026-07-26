/**
 * MotionManager — Framer variants + GSAP timeline execution
 */

import gsap from "gsap";
import { getAnimationDef, resolveMotionForState } from "./AnimationRegistry";
import type { MotionState, MotionSlotBinding } from "./types";

type GsapPresetFn = (target: Element | string, opts?: Record<string, unknown>) => gsap.core.Timeline;

const GSAP_PRESETS: Record<string, GsapPresetFn> = {
  wheelSpin: (target) =>
    gsap.timeline().to(target, { rotation: 360, duration: 2, ease: "power2.in", repeat: -1 }),
  revealBurst: (target) =>
    gsap.timeline()
      .fromTo(target, { scale: 0.3, opacity: 0 }, { scale: 1.5, opacity: 0.8, duration: 0.4, ease: "power2.out" })
      .to(target, { scale: 2, opacity: 0, duration: 0.3 }),
  coinBurst: (target) =>
    gsap.timeline().fromTo(target, { scale: 0.5 }, { scale: 1.2, duration: 0.5, ease: "back.out(2)" }),
  voidCollapse: (target) =>
    gsap.timeline().to(target, { scale: 0.8, opacity: 0.3, filter: "grayscale(1)", duration: 0.8 }),
  stealSlash: (target) =>
    gsap.timeline()
      .fromTo(target, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.15 })
      .to(target, { x: 100, opacity: 0, duration: 0.2 }),
  cloakFade: (target) =>
    gsap.timeline().to(target, { opacity: 0.3, filter: "blur(4px)", duration: 0.6 }),
  reviveRebuild: (target) =>
    gsap.timeline().fromTo(target, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }),
  victoryBurst: (target) =>
    gsap.timeline()
      .fromTo(target, { scale: 0.2, opacity: 0 }, { scale: 1.3, opacity: 1, duration: 0.5, ease: "power4.out" })
      .to(target, { scale: 1, duration: 0.3 }),
};

export class MotionManager {
  private bindings = new Map<string, MotionSlotBinding>();
  private activeTimelines = new Map<string, gsap.core.Timeline>();
  private pausedSlots = new Set<string>();
  private visibilityObserver: IntersectionObserver | null = null;
  private targetFpsCap = 60;

  registerSlot(binding: MotionSlotBinding): () => void {
    this.bindings.set(binding.motionId, binding);
    return () => {
      this.bindings.delete(binding.motionId);
      this.pausedSlots.delete(binding.motionId);
    };
  }

  observeVisibility(element: Element, motionId: string): () => void {
    if (typeof IntersectionObserver === "undefined") return () => undefined;

    if (!this.visibilityObserver) {
      this.visibilityObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.motionId;
          if (!id) continue;
          const binding = this.bindings.get(id);
          if (!binding) continue;
          if (entry.isIntersecting) {
            this.pausedSlots.delete(id);
            binding.resume?.();
          } else {
            this.pausedSlots.add(id);
            binding.pause?.();
            this.activeTimelines.get(id)?.pause();
          }
        }
      }, { threshold: 0.05 });
    }

    (element as HTMLElement).dataset.motionId = motionId;
    this.visibilityObserver.observe(element);
    return () => this.visibilityObserver?.unobserve(element);
  }

  playPreset(preset: string, target: Element | string, motionId?: string): gsap.core.Timeline | null {
    const fn = GSAP_PRESETS[preset];
    if (!fn) return null;
    const tl = fn(target);
    if (motionId) {
      this.activeTimelines.get(motionId)?.kill();
      this.activeTimelines.set(motionId, tl);
    }
    return tl;
  }

  fireState(state: MotionState, motionId?: string): void {
    const animId = motionId ?? resolveMotionForState(state);
    if (!animId) return;

    const def = getAnimationDef(animId);
    const binding = this.bindings.get(animId);
    binding?.playVariant?.(state);

    if (def?.gsapPreset && typeof document !== "undefined") {
      const el = document.querySelector(`[data-motion-layer="${animId}"]`);
      if (el) this.playPreset(def.gsapPreset, el, animId);
    }
  }

  killAll(): void {
    for (const tl of this.activeTimelines.values()) tl.kill();
    this.activeTimelines.clear();
  }

  applyQualityTier(tier: "ultra" | "high" | "medium" | "low" | "minimal"): void {
    this.targetFpsCap = tier === "minimal" || tier === "low" ? 30 : tier === "medium" ? 45 : 60;
    gsap.ticker.fps(this.targetFpsCap);
  }

  getTargetFpsCap(): number {
    return this.targetFpsCap;
  }
}

export const motionManager = new MotionManager();
