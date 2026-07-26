/**
 * AudioManager — Howler-based layered mixer
 */

import { Howl, Howler } from "howler";
import { AUDIO_CUE_REGISTRY } from "./AudioRegistry";
import type { AudioChannel, AudioCueDef, LegacyAudioLayer } from "./types";

const DEFAULT_CHANNEL_VOLUMES: Record<AudioChannel, number> = {
  ambient: 0.3,
  gameplay: 0.85,
  ui: 0.6,
  music: 0.45,
  voice: 0,
};

const LEGACY_LAYER_TO_CHANNEL: Record<LegacyAudioLayer, AudioChannel> = {
  ambient: "ambient",
  environment: "ambient",
  mechanical: "gameplay",
  combat: "gameplay",
  reward: "gameplay",
  ui: "ui",
  music: "music",
  voice: "voice",
};

export class AudioManager {
  private howls = new Map<string, Howl>();
  private activeIds = new Map<string, number>();
  private channelVolumes: Record<AudioChannel, number> = { ...DEFAULT_CHANNEL_VOLUMES };
  private masterVolume = 1;
  private muted = false;
  private initialized = false;
  private backgroundPaused = false;

  initialize(): void {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.backgroundPaused = true;
        Howler.volume(this.muted ? 0 : this.masterVolume * 0.15);
      } else {
        this.backgroundPaused = false;
        Howler.volume(this.muted ? 0 : this.masterVolume);
      }
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private getHowl(cue: AudioCueDef): Howl {
    let howl = this.howls.get(cue.id);
    if (!howl) {
      howl = new Howl({
        src: [cue.path],
        loop: cue.loop ?? false,
        volume: 0,
        preload: true,
        onloaderror: () => undefined,
      });
      this.howls.set(cue.id, howl);
    }
    return howl;
  }

  private effectiveVolume(cue: AudioCueDef, override?: number): number {
    const base = override ?? cue.volume;
    const jitter = 1 + (Math.random() * 2 - 1) * (cue.volumeVariance ?? 0.1);
    const channel = this.channelVolumes[cue.channel] ?? 1;
    return Math.max(0, Math.min(1, base * jitter * channel * this.masterVolume));
  }

  private effectiveRate(cue: AudioCueDef, rateOverride?: number): number {
    if (rateOverride !== undefined) return rateOverride;
    const variance = cue.pitchVariance ?? 0.05;
    return 1 + (Math.random() * 2 - 1) * variance;
  }

  play(cueId: string, overrideVolume?: number, rateOverride?: number): void {
    if (this.muted || !this.initialized || this.backgroundPaused) return;
    const cue = AUDIO_CUE_REGISTRY[cueId];
    if (!cue) {
      console.warn(`[AudioManager] Unknown cue: ${cueId}`);
      return;
    }

    const howl = this.getHowl(cue);
    const vol = this.effectiveVolume(cue, overrideVolume);
    const rate = this.effectiveRate(cue, rateOverride);

    if (cue.loop) {
      const existing = this.activeIds.get(cueId);
      if (existing !== undefined) {
        howl.rate(rate, existing);
        howl.volume(vol, existing);
        return;
      }
    }

    howl.rate(rate);
    const id = howl.play();
    this.activeIds.set(cueId, id);

    if (cue.fadeIn && cue.fadeIn > 0) {
      howl.volume(0, id);
      howl.fade(0, vol, cue.fadeIn, id);
    } else {
      howl.volume(vol, id);
    }

    if (!cue.loop) {
      howl.once("end", () => {
        this.activeIds.delete(cueId);
      }, id);
    }
  }

  /** Speed-linked wheel rotation pitch (0.5–2.0) */
  setPlaybackRate(cueId: string, rate: number): void {
    const howl = this.howls.get(cueId);
    const soundId = this.activeIds.get(cueId);
    if (!howl || soundId === undefined) return;
    howl.rate(Math.max(0.5, Math.min(2, rate)), soundId);
  }

  stop(cueId: string, fadeMs = 0): void {
    const howl = this.howls.get(cueId);
    const soundId = this.activeIds.get(cueId);
    if (!howl || soundId === undefined) return;

    const cue = AUDIO_CUE_REGISTRY[cueId];
    const fade = fadeMs || cue?.fadeOut || 0;

    if (fade > 0) {
      const currentVol = howl.volume(soundId) as number;
      howl.fade(currentVol, 0, fade, soundId);
      howl.once("fade", () => {
        howl.stop(soundId);
        this.activeIds.delete(cueId);
      }, soundId);
    } else {
      howl.stop(soundId);
      this.activeIds.delete(cueId);
    }
  }

  stopChannel(channel: AudioChannel, fadeMs = 300): void {
    for (const [id, cue] of Object.entries(AUDIO_CUE_REGISTRY)) {
      if (cue.channel === channel && this.activeIds.has(id)) {
        this.stop(id, fadeMs);
      }
    }
  }

  stopAll(fadeMs = 0): void {
    for (const cueId of [...this.activeIds.keys()]) {
      this.stop(cueId, fadeMs);
    }
  }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    Howler.volume(this.muted ? 0 : this.masterVolume);
  }

  setChannelVolume(channel: AudioChannel, v: number): void {
    this.channelVolumes[channel] = Math.max(0, Math.min(1, v));
    for (const [cueId, soundId] of this.activeIds) {
      const cue = AUDIO_CUE_REGISTRY[cueId];
      if (cue?.channel === channel) {
        const howl = this.howls.get(cueId);
        howl?.volume(this.effectiveVolume(cue), soundId);
      }
    }
  }

  setMute(mute: boolean): void {
    this.muted = mute;
    Howler.volume(mute ? 0 : this.masterVolume);
    if (mute) this.stopAll(100);
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicIntensity(intensity: string): void {
    const volumes: Record<string, number> = {
      calm: 0.2,
      building: 0.35,
      active: 0.45,
      tension: 0.55,
      peak: 0.65,
      resolution: 0.3,
    };
    this.setChannelVolume("music", volumes[intensity] ?? 0.45);
  }

  applyQualityTier(tier: "ultra" | "high" | "medium" | "low" | "minimal"): void {
    const ambientScale = tier === "minimal" ? 0 : tier === "low" ? 0.3 : tier === "medium" ? 0.6 : 1;
    const gameplayScale = tier === "minimal" ? 0.5 : tier === "low" ? 0.75 : 1;
    this.setChannelVolume("ambient", DEFAULT_CHANNEL_VOLUMES.ambient * ambientScale);
    this.setChannelVolume("gameplay", DEFAULT_CHANNEL_VOLUMES.gameplay * gameplayScale);
    if (tier === "minimal") this.stopChannel("ambient", 400);
  }
}

export const audioManager = new AudioManager();
