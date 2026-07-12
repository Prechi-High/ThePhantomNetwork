/**
 * Audio Layer Architecture — Layered Gameplay Audio
 *
 * All audio is organized by layer — not by component.
 * Nothing plays independently. Everything mixed through one controller.
 *
 * Layers (mixed simultaneously):
 *   ambient    — background world hum, arena atmosphere
 *   mechanical — wheel spin, brake, lock sounds
 *   combat     — steal, shield, boost sounds
 *   ui         — button taps, HUD transitions
 *   reward     — token collection, rank up, reveal stinger
 *   music      — adaptive background score
 *   voice      — squad communication
 *   environment — crowd, energy, announcements
 *
 * Dynamic music — intensity changes with gameplay state.
 */

export type AudioLayer =
  | "ambient"
  | "mechanical"
  | "combat"
  | "ui"
  | "reward"
  | "music"
  | "voice"
  | "environment";

export type MusicIntensity = "calm" | "building" | "active" | "tension" | "peak" | "resolution";

export interface AudioCue {
  id: string;
  path: string;
  layer: AudioLayer;
  volume: number;
  loop?: boolean;
  /** Fade in duration ms */
  fadeIn?: number;
  /** Fade out duration ms */
  fadeOut?: number;
}

// ── Audio cue library ─────────────────────────────────────────────────────

export const AUDIO_CUES: Record<string, AudioCue> = {
  // Mechanical
  spin_start:     { id: "spin_start",    path: "/audio/wheel/spin-start.mp3",    layer: "mechanical", volume: 0.75 },
  spin_loop:      { id: "spin_loop",     path: "/audio/wheel/spin-loop.mp3",     layer: "mechanical", volume: 0.5,  loop: true },
  spin_brake:     { id: "spin_brake",    path: "/audio/wheel/spin-slowdown.mp3", layer: "mechanical", volume: 0.7 },
  spin_lock:      { id: "spin_lock",     path: "/audio/wheel/spin-stop.mp3",     layer: "mechanical", volume: 0.9 },
  needle_tick:    { id: "needle_tick",   path: "/audio/wheel/token-tick.mp3",    layer: "mechanical", volume: 0.3 },

  // Reward — reveal stingers
  reveal_burst:   { id: "reveal_burst",  path: "/audio/wheel/reveal-burst.mp3",  layer: "reward",     volume: 0.8 },
  outcome_advance:{ id: "outcome_advance",path:"/audio/wheel/outcome-advance.mp3",layer: "reward",     volume: 0.95 },
  outcome_acquire:{ id: "outcome_acquire",path:"/audio/wheel/outcome-acquire.mp3",layer: "reward",     volume: 0.85 },
  outcome_discover:{id:"outcome_discover",path:"/audio/wheel/outcome-discover.mp3",layer:"reward",     volume: 0.75 },
  outcome_steal:  { id: "outcome_steal", path: "/audio/wheel/outcome-steal.mp3", layer: "reward",     volume: 0.9 },
  outcome_void:   { id: "outcome_void",  path: "/audio/wheel/outcome-void.mp3",  layer: "reward",     volume: 0.6 },
  tokens_complete:{ id: "tokens_complete",path:"/audio/wheel/tokens-complete.mp3",layer:"reward",     volume: 0.7 },

  // Combat
  steal_activate: { id: "steal_activate",path: "/audio/combat/steal-activate.mp3",layer:"combat",    volume: 0.85 },
  shield_hit:     { id: "shield_hit",   path: "/audio/combat/shield-hit.mp3",    layer: "combat",     volume: 0.8 },
  revive_start:   { id: "revive_start", path: "/audio/combat/revive-start.mp3",  layer: "combat",     volume: 0.7 },
  revive_complete:{ id: "revive_complete",path:"/audio/combat/revive-complete.mp3",layer:"combat",    volume: 0.9 },

  // UI
  button_tap:     { id: "button_tap",   path: "/audio/ui/button-tap.mp3",        layer: "ui",         volume: 0.5 },
  hud_tick:       { id: "hud_tick",     path: "/audio/ui/hud-tick.mp3",          layer: "ui",         volume: 0.3 },

  // Ambient
  arena_hum:      { id: "arena_hum",    path: "/audio/ambient/arena-idle.mp3",   layer: "ambient",    volume: 0.25, loop: true, fadeIn: 2000 },
};

// ── Volume per layer ───────────────────────────────────────────────────────

const DEFAULT_LAYER_VOLUMES: Record<AudioLayer, number> = {
  ambient:     0.3,
  mechanical:  0.8,
  combat:      0.85,
  ui:          0.6,
  reward:      0.9,
  music:       0.45,
  voice:       1.0,
  environment: 0.4,
};

// ── Audio Layer Controller ─────────────────────────────────────────────────

export class AudioLayerController {
  private sounds:       Map<string, HTMLAudioElement> = new Map();
  private layerVolumes: Record<AudioLayer, number>   = { ...DEFAULT_LAYER_VOLUMES };
  private masterVolume  = 1.0;
  private muted         = false;
  private initialized   = false;

  // ── Initialization (must be called on first user gesture) ────────────────
  async initialize(): Promise<void> {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
  }

  // ── Playback ──────────────────────────────────────────────────────────────
  play(cueId: string, overrideVolume?: number): void {
    if (this.muted || !this.initialized) return;
    const cue = AUDIO_CUES[cueId];
    if (!cue) { console.warn(`[AudioLayer] Unknown cue: ${cueId}`); return; }

    const effectiveVolume =
      (overrideVolume ?? cue.volume) *
      this.layerVolumes[cue.layer] *
      this.masterVolume;

    try {
      let audio = this.sounds.get(cueId);
      if (audio && !cue.loop) {
        audio.pause();
        audio.currentTime = 0;
      } else if (!audio) {
        audio = new Audio(cue.path);
        this.sounds.set(cueId, audio);
      }
      audio.volume = Math.max(0, Math.min(1, effectiveVolume));
      audio.loop   = cue.loop ?? false;
      audio.play().catch(() => {/* autoplay blocked */});

      if (!cue.loop) {
        audio.onended = () => this.sounds.delete(cueId);
      }
    } catch {/* SSR safe */}
  }

  stop(cueId: string, fadeMs = 0): void {
    const audio = this.sounds.get(cueId);
    if (!audio) return;

    if (fadeMs > 0 && !this.muted) {
      const originalVol = audio.volume;
      const steps = 10;
      const stepMs = fadeMs / steps;
      let step = 0;
      const id = setInterval(() => {
        step++;
        audio.volume = Math.max(0, originalVol * (1 - step / steps));
        if (step >= steps) {
          clearInterval(id);
          audio.pause();
          audio.currentTime = 0;
          this.sounds.delete(cueId);
        }
      }, stepMs);
    } else {
      audio.pause();
      audio.currentTime = 0;
      this.sounds.delete(cueId);
    }
  }

  stopLayer(layer: AudioLayer, fadeMs = 300): void {
    this.sounds.forEach((audio, id) => {
      const cue = AUDIO_CUES[id];
      if (cue?.layer === layer) this.stop(id, fadeMs);
    });
  }

  stopAll(fadeMs = 0): void {
    this.sounds.forEach((_, id) => this.stop(id, fadeMs));
  }

  // ── Volume ────────────────────────────────────────────────────────────────
  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    this.updateAllVolumes();
  }

  setLayerVolume(layer: AudioLayer, v: number): void {
    this.layerVolumes[layer] = Math.max(0, Math.min(1, v));
    this.sounds.forEach((audio, id) => {
      const cue = AUDIO_CUES[id];
      if (cue?.layer === layer) {
        audio.volume = cue.volume * this.layerVolumes[layer] * this.masterVolume;
      }
    });
  }

  setMute(mute: boolean): void {
    this.muted = mute;
    if (mute) this.stopAll();
  }

  isMuted(): boolean { return this.muted; }

  // ── Music intensity ───────────────────────────────────────────────────────
  setMusicIntensity(intensity: MusicIntensity): void {
    const volumes: Record<MusicIntensity, number> = {
      calm:       0.2,
      building:   0.35,
      active:     0.45,
      tension:    0.55,
      peak:       0.65,
      resolution: 0.3,
    };
    this.setLayerVolume("music", volumes[intensity]);
  }

  private updateAllVolumes(): void {
    this.sounds.forEach((audio, id) => {
      const cue = AUDIO_CUES[id];
      if (cue) {
        audio.volume = Math.max(0, Math.min(1, cue.volume * this.layerVolumes[cue.layer] * this.masterVolume));
      }
    });
  }
}

export const audioLayerController = new AudioLayerController();
