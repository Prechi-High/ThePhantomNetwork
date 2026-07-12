/**
 * Camera System — Subtle Gameplay Camera
 *
 * Not a real 3D camera. A CSS/DOM gameplay feel system.
 * Reactions are micro-scale — never nauseating.
 * Every reaction belongs to a gameplay event.
 *
 * Camera reactions:
 *   punch     — tiny forward zoom on impact (reveal)
 *   shake     — lateral micro-shake (steal, danger)
 *   zoom_in   — slow zoom for focus (championship buildup)
 *   zoom_out  — pull back for context (revive, reveal result)
 *   wider     — dramatic wide frame (championship)
 *   none      — no camera reaction
 */

export type CameraReaction =
  | "none"
  | "punch"
  | "shake"
  | "zoom_in"
  | "zoom_out"
  | "wider";

export interface CameraFrame {
  scale: number;
  translateX: number;
  translateY: number;
  duration: number;
  ease: string;
}

// ── Reaction presets ──────────────────────────────────────────────────────

const CAMERA_PRESETS: Record<CameraReaction, CameraFrame[]> = {
  none: [],

  punch: [
    { scale: 1.025, translateX: 0, translateY: -2, duration: 80,  ease: "ease-out" },
    { scale: 1.0,   translateX: 0, translateY: 0,  duration: 200, ease: "ease-in-out" },
  ],

  shake: [
    { scale: 1.0, translateX: 4,  translateY: 2,  duration: 50,  ease: "ease-out" },
    { scale: 1.0, translateX: -3, translateY: -2, duration: 50,  ease: "ease-in-out" },
    { scale: 1.0, translateX: 2,  translateY: 1,  duration: 50,  ease: "ease-in-out" },
    { scale: 1.0, translateX: 0,  translateY: 0,  duration: 80,  ease: "ease-in-out" },
  ],

  zoom_in: [
    { scale: 1.04, translateX: 0, translateY: 0, duration: 600, ease: "ease-out" },
    { scale: 1.0,  translateX: 0, translateY: 0, duration: 800, ease: "ease-in-out" },
  ],

  zoom_out: [
    { scale: 0.97, translateX: 0, translateY: 0, duration: 400, ease: "ease-out" },
    { scale: 1.0,  translateX: 0, translateY: 0, duration: 600, ease: "ease-in-out" },
  ],

  wider: [
    { scale: 0.95, translateX: 0, translateY: 0, duration: 800,  ease: "ease-out" },
    { scale: 1.0,  translateX: 0, translateY: 0, duration: 1200, ease: "ease-in-out" },
  ],
};

// ── Camera Controller ─────────────────────────────────────────────────────

export class CameraSystem {
  private rootElement: HTMLElement | null = null;
  private currentAnimation: ReturnType<typeof setTimeout>[] = [];

  mount(element: HTMLElement): void {
    this.rootElement = element;
  }

  unmount(): void {
    this.cancel();
    this.rootElement = null;
  }

  trigger(reaction: CameraReaction): void {
    if (reaction === "none" || !this.rootElement) return;
    if (typeof window === "undefined") return;

    const frames = CAMERA_PRESETS[reaction];
    if (!frames.length) return;

    this.cancel();
    this.applyFrames(frames, 0);
  }

  private applyFrames(frames: CameraFrame[], index: number): void {
    if (!this.rootElement || index >= frames.length) {
      if (this.rootElement) {
        this.rootElement.style.transform  = "";
        this.rootElement.style.transition = "";
      }
      return;
    }

    const frame = frames[index];
    this.rootElement.style.transition = `transform ${frame.duration}ms ${frame.ease}`;
    this.rootElement.style.transform  =
      `scale(${frame.scale}) translate(${frame.translateX}px, ${frame.translateY}px)`;

    const t = setTimeout(
      () => this.applyFrames(frames, index + 1),
      frame.duration
    );
    this.currentAnimation.push(t);
  }

  cancel(): void {
    this.currentAnimation.forEach(clearTimeout);
    this.currentAnimation = [];
    if (this.rootElement) {
      this.rootElement.style.transform  = "";
      this.rootElement.style.transition = "";
    }
  }
}

export const cameraSystem = new CameraSystem();
