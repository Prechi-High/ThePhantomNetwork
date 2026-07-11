import { AUDIO_CONFIG } from "@/config/spinConfig";
import type { SpinOutcome } from "@/types/gameplay";

class SpinAudioController {
  private activeSounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  private playSound(key: string, path: string, volume: number, loop: boolean = false): void {
    if (this.isMuted) return;
    try {
      // If sound is already playing, either reuse it or stop it first
      let audio = this.activeSounds.get(key);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio = new Audio(path);
        this.activeSounds.set(key, audio);
      }
      audio.volume = volume;
      audio.loop = loop;
      audio.play().catch(() => {
        // Safe catch for browsers blocking autoplay before user interaction
      });
    } catch {
      // Safe catch for environment issues (e.g. server-side rendering)
    }
  }

  private stopSound(key: string): void {
    const audio = this.activeSounds.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  playSpinStart(): void {
    this.playSound("spinStart", AUDIO_CONFIG.PATHS.SPIN_START, AUDIO_CONFIG.VOLUME.SPIN_START);
    this.playSpinLoop();
  }

  private playSpinLoop(): void {
    this.playSound("spinLoop", AUDIO_CONFIG.PATHS.SPIN_LOOP, AUDIO_CONFIG.VOLUME.SPIN_LOOP, true);
  }

  playSpinSlowdown(): void {
    this.stopSound("spinLoop");
    this.playSound("spinSlowdown", AUDIO_CONFIG.PATHS.SPIN_SLOWDOWN, AUDIO_CONFIG.VOLUME.SPIN_LOOP);
  }

  playSpinStop(): void {
    this.stopSound("spinStart");
    this.stopSound("spinLoop");
    this.stopSound("spinSlowdown");
    this.playSound("spinStop", AUDIO_CONFIG.PATHS.SPIN_STOP, AUDIO_CONFIG.VOLUME.SPIN_STOP);
  }

  playRevealBurst(): void {
    this.playSound("revealBurst", AUDIO_CONFIG.PATHS.REVEAL_BURST, AUDIO_CONFIG.VOLUME.REVEAL);
  }

  playOutcome(outcome: SpinOutcome): void {
    const pathKey = `OUTCOME_${outcome}` as keyof typeof AUDIO_CONFIG.PATHS;
    const path = AUDIO_CONFIG.PATHS[pathKey];
    if (path) {
      this.playSound("outcome", path, AUDIO_CONFIG.VOLUME.REVEAL);
    }
  }

  playTokenTick(): void {
    // Generate a new temporary sound instance to allow overlapping ticks
    if (this.isMuted) return;
    try {
      const audio = new Audio(AUDIO_CONFIG.PATHS.TOKEN_TICK);
      audio.volume = AUDIO_CONFIG.VOLUME.TOKEN_COLLECT;
      audio.play().catch(() => {});
    } catch {
      // Safe catch
    }
  }

  stopAll(): void {
    this.activeSounds.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    this.activeSounds.clear();
  }

  setMute(mute: boolean): void {
    this.isMuted = mute;
    if (mute) {
      this.stopAll();
    }
  }
}

export const spinAudio = new SpinAudioController();
