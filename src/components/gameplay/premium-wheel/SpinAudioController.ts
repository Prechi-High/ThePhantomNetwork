/**
 * SpinAudioController
 * Layered audio playback synchronized to the runtime spin timeline.
 * All audio follows the gameplay event sequence — nothing plays independently.
 */

import { AUDIO_CONFIG } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

class SpinAudioController {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted = false;

  // ---- Core playback ----

  private play(
    key: string,
    path: string,
    volume: number,
    loop = false,
  ): void {
    if (this.muted || typeof window === "undefined") return;
    try {
      let audio = this.sounds.get(key);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio = new Audio(path);
        this.sounds.set(key, audio);
      }
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.loop = loop;
      audio.play().catch(() => {/* autoplay blocked — safe to ignore */});
    } catch {/* SSR safety */}
  }

  private stop(key: string): void {
    const audio = this.sounds.get(key);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  // ---- Spin lifecycle sounds ----

  /** 0.0s — charge hum + mechanical spin start */
  playSpinStart(): void {
    this.play("spinStart", AUDIO_CONFIG.PATHS.SPIN_START, AUDIO_CONFIG.VOLUME.SPIN_START);
    this.play("spinLoop", AUDIO_CONFIG.PATHS.SPIN_LOOP, AUDIO_CONFIG.VOLUME.SPIN_LOOP, true);
  }

  /** At SLOWDOWN_START — brake scrape, stop loop */
  playSpinSlowdown(): void {
    this.stop("spinLoop");
    this.play("spinSlowdown", AUDIO_CONFIG.PATHS.SPIN_SLOWDOWN, AUDIO_CONFIG.VOLUME.SPIN_LOOP);
  }

  /** Wheel final lock — hard click */
  playSpinStop(): void {
    this.stop("spinStart");
    this.stop("spinLoop");
    this.stop("spinSlowdown");
    this.play("spinStop", AUDIO_CONFIG.PATHS.SPIN_STOP, AUDIO_CONFIG.VOLUME.SPIN_STOP);
  }

  /** Pointer tick — overlapping instances allowed */
  playPointerTick(): void {
    if (this.muted || typeof window === "undefined") return;
    try {
      const audio = new Audio(AUDIO_CONFIG.PATHS.TOKEN_TICK);
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch {/* SSR safety */}
  }

  // ---- Reveal sounds ----

  /** Suspense → energy formation */
  playRevealBurst(): void {
    this.play("revealBurst", AUDIO_CONFIG.PATHS.REVEAL_BURST, AUDIO_CONFIG.VOLUME.REVEAL);
  }

  /** Outcome-specific result stinger */
  playOutcome(outcome: SpinOutcome): void {
    const pathKey = `OUTCOME_${outcome}` as keyof typeof AUDIO_CONFIG.PATHS;
    const path = AUDIO_CONFIG.PATHS[pathKey];
    if (path) {
      this.play("outcome", path as string, AUDIO_CONFIG.VOLUME.REVEAL);
    }
  }

  // ---- Token collection ----

  /** Token impact tick — overlapping allowed */
  playTokenTick(): void {
    if (this.muted || typeof window === "undefined") return;
    try {
      const audio = new Audio(AUDIO_CONFIG.PATHS.TOKEN_TICK);
      audio.volume = AUDIO_CONFIG.VOLUME.TOKEN_COLLECT;
      audio.play().catch(() => {});
    } catch {/* SSR safety */}
  }

  // ---- Control ----

  stopAll(): void {
    this.sounds.forEach((audio) => {
      try { audio.pause(); audio.currentTime = 0; } catch {/* safe */}
    });
    this.sounds.clear();
  }

  setMute(mute: boolean): void {
    this.muted = mute;
    if (mute) this.stopAll();
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export const spinAudio = new SpinAudioController();
