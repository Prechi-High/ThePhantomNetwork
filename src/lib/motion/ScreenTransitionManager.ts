/**
 * ScreenTransitionManager — GSAP page transitions
 */

import gsap from "gsap";

export type TransitionType = "fade" | "scale" | "blur" | "slideUp" | "slideLeft";

export class ScreenTransitionManager {
  private activeTimeline: gsap.core.Timeline | null = null;

  transition(
    outgoing: Element | null,
    incoming: Element | null,
    type: TransitionType = "fade",
    onComplete?: () => void
  ): void {
    this.activeTimeline?.kill();
    const tl = gsap.timeline({ onComplete });

    if (outgoing) {
      switch (type) {
        case "scale":
          tl.to(outgoing, { scale: 0.95, opacity: 0, duration: 0.35, ease: "power2.in" });
          break;
        case "blur":
          tl.to(outgoing, { opacity: 0, filter: "blur(8px)", duration: 0.4 });
          break;
        case "slideUp":
          tl.to(outgoing, { y: -40, opacity: 0, duration: 0.35 });
          break;
        case "slideLeft":
          tl.to(outgoing, { x: -60, opacity: 0, duration: 0.35 });
          break;
        default:
          tl.to(outgoing, { opacity: 0, duration: 0.3 });
      }
    }

    if (incoming) {
      gsap.set(incoming, { opacity: 0 });
      switch (type) {
        case "scale":
          tl.fromTo(incoming, { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.1");
          break;
        case "blur":
          tl.fromTo(incoming, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.4 }, "-=0.15");
          break;
        case "slideUp":
          tl.fromTo(incoming, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.1");
          break;
        case "slideLeft":
          tl.fromTo(incoming, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, "-=0.1");
          break;
        default:
          tl.to(incoming, { opacity: 1, duration: 0.35 }, "-=0.1");
      }
    }

    this.activeTimeline = tl;
  }

  kill(): void {
    this.activeTimeline?.kill();
    this.activeTimeline = null;
  }
}

export const screenTransitionManager = new ScreenTransitionManager();
