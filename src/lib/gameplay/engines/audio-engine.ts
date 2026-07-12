/**
 * Audio Engine
 * 
 * Owns all gameplay audio:
 * - Music
 * - Wheel sounds
 * - Reveal sounds
 * - Ambient world
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';

export interface AudioTrack {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
  category: 'music' | 'sfx' | 'ambient' | 'voice';
}

interface ActiveSound {
  audio: HTMLAudioElement;
  track: AudioTrack;
  startTime: number;
}

export class AudioEngine implements EngineInterface {
  private sounds: Map<string, ActiveSound> = new Map();
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private ambientVolume: number = 0.5;

  private audioContext: AudioContext | null = null;
  private initialized: boolean = false;

  constructor() {
    this.setupListeners();
    this.defineTracks();
  }

  private defineTracks(): void {
    // Audio tracks are defined here
    // Paths are relative to /public/audio/
  }

  private setupListeners(): void {
    // Spin sounds
    gameplayEvents.on('SPIN_STARTED', () => {
      this.play('spin-start');
    });

    gameplayEvents.on('SPIN_ACCELERATION', () => {
      this.play('spin-accelerate');
    });

    gameplayEvents.on('SPIN_DECELERATION', () => {
      this.play('spin-decelerate');
    });

    gameplayEvents.on('SPIN_POINTER_LOCK', () => {
      this.play('spin-lock');
    });

    // Reveal sounds
    gameplayEvents.on('REVEAL_STARTED', () => {
      this.play('reveal-buildup');
    });

    gameplayEvents.on('OUTCOME_REVEAL', (event) => {
      const payload = event.payload as { outcome: string };
      this.playOutcomeSound(payload.outcome);
    });

    // Token sounds
    gameplayEvents.on('TOKEN_COLLECTED', () => {
      this.play('token-tick');
    });

    gameplayEvents.on('TOKEN_COLLECTION_COMPLETED', () => {
      this.play('tokens-complete');
    });

    // Effect sounds
    gameplayEvents.on('EFFECT_TRIGGERED', (event) => {
      const payload = event.payload as { type: string };
      this.playEffectSound(payload.type);
    });

    // Phase sounds
    gameplayEvents.on('PHASE_STARTED', (event) => {
      const payload = event.payload as { phase: number };
      this.playPhaseSound(payload.phase);
    });
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      console.log('[AudioEngine] Initialized');
    } catch (e) {
      console.warn('[AudioEngine] Failed to initialize AudioContext:', e);
    }
  }

  // ============================================================================
  // PLAYBACK
  // ============================================================================

  async play(soundId: string): Promise<void> {
    await this.initialize();

    const track = this.getTrackDefinition(soundId);
    if (!track) {
      console.warn(`[AudioEngine] Unknown sound: ${soundId}`);
      return;
    }

    try {
      const audio = new Audio(track.src);
      audio.volume = this.getEffectiveVolume(track.category) * track.volume;
      audio.loop = track.loop;

      const activeSound: ActiveSound = {
        audio,
        track,
        startTime: Date.now(),
      };

      this.sounds.set(soundId, activeSound);
      await audio.play();

      if (!track.loop) {
        audio.onended = () => {
          this.sounds.delete(soundId);
        };
      }

    } catch (e) {
      console.warn(`[AudioEngine] Failed to play ${soundId}:`, e);
    }
  }

  stop(soundId: string): void {
    const sound = this.sounds.get(soundId);
    if (sound) {
      sound.audio.pause();
      sound.audio.currentTime = 0;
      this.sounds.delete(soundId);
    }
  }

  stopAll(): void {
    this.sounds.forEach((sound, id) => {
      sound.audio.pause();
      sound.audio.currentTime = 0;
    });
    this.sounds.clear();
  }

  stopCategory(category: AudioTrack['category']): void {
    this.sounds.forEach((sound, id) => {
      if (sound.track.category === category) {
        sound.audio.pause();
        sound.audio.currentTime = 0;
        this.sounds.delete(id);
      }
    });
  }

  // ============================================================================
  // SPECIALIZED SOUNDS
  // ============================================================================

  private async playOutcomeSound(outcome: string): Promise<void> {
    const soundMap: Record<string, string> = {
      ADVANCE: 'outcome-advance',
      ACQUIRE: 'outcome-acquire',
      DISCOVER: 'outcome-discover',
      STEAL: 'outcome-steal',
      VOID: 'outcome-void',
    };

    const soundId = soundMap[outcome];
    if (soundId) {
      await this.play(soundId);
    }
  }

  private async playEffectSound(type: string): Promise<void> {
    const soundMap: Record<string, string> = {
      shield: 'effect-shield',
      cloak: 'effect-cloak',
      insurance: 'effect-insurance',
      boost: 'effect-boost',
    };

    const soundId = soundMap[type];
    if (soundId) {
      await this.play(soundId);
    }
  }

  private async playPhaseSound(phase: number): Promise<void> {
    await this.play(`phase-${phase}`);
  }

  // ============================================================================
  // VOLUME
  // ============================================================================

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  private getEffectiveVolume(category: AudioTrack['category']): number {
    const categoryVolume = {
      music: this.musicVolume,
      sfx: this.sfxVolume,
      ambient: this.ambientVolume,
      voice: 1.0,
    }[category] || 1.0;

    return this.masterVolume * categoryVolume;
  }

  private updateAllVolumes(): void {
    this.sounds.forEach((sound) => {
      sound.audio.volume = this.getEffectiveVolume(sound.track.category) * sound.track.volume;
    });
  }

  // ============================================================================
  // TRACK DEFINITIONS
  // ============================================================================

  private getTrackDefinition(soundId: string): AudioTrack | null {
    const tracks: Record<string, AudioTrack> = {
      'spin-start': {
        id: 'spin-start',
        src: '/audio/wheel/spin-start.mp3',
        volume: 0.8,
        loop: false,
        category: 'sfx',
      },
      'spin-accelerate': {
        id: 'spin-accelerate',
        src: '/audio/wheel/spin-loop.mp3',
        volume: 0.6,
        loop: true,
        category: 'sfx',
      },
      'spin-decelerate': {
        id: 'spin-decelerate',
        src: '/audio/wheel/spin-slowdown.mp3',
        volume: 0.7,
        loop: false,
        category: 'sfx',
      },
      'spin-lock': {
        id: 'spin-lock',
        src: '/audio/wheel/spin-stop.mp3',
        volume: 0.9,
        loop: false,
        category: 'sfx',
      },
      'reveal-buildup': {
        id: 'reveal-buildup',
        src: '/audio/wheel/reveal-burst.mp3',
        volume: 0.8,
        loop: false,
        category: 'sfx',
      },
      'outcome-advance': {
        id: 'outcome-advance',
        src: '/audio/wheel/outcome-advance.mp3',
        volume: 0.9,
        loop: false,
        category: 'sfx',
      },
      'outcome-acquire': {
        id: 'outcome-acquire',
        src: '/audio/wheel/outcome-acquire.mp3',
        volume: 0.8,
        loop: false,
        category: 'sfx',
      },
      'outcome-discover': {
        id: 'outcome-discover',
        src: '/audio/wheel/outcome-discover.mp3',
        volume: 0.7,
        loop: false,
        category: 'sfx',
      },
      'outcome-steal': {
        id: 'outcome-steal',
        src: '/audio/wheel/outcome-steal.mp3',
        volume: 0.85,
        loop: false,
        category: 'sfx',
      },
      'outcome-void': {
        id: 'outcome-void',
        src: '/audio/wheel/outcome-void.mp3',
        volume: 0.6,
        loop: false,
        category: 'sfx',
      },
      'token-tick': {
        id: 'token-tick',
        src: '/audio/wheel/token-tick.mp3',
        volume: 0.5,
        loop: false,
        category: 'sfx',
      },
      'tokens-complete': {
        id: 'tokens-complete',
        src: '/audio/wheel/tokens-complete.mp3',
        volume: 0.7,
        loop: false,
        category: 'sfx',
      },
    };

    return tracks[soundId] || null;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  handleEvent(_event: GameplayEvent): void {
    // Events are handled via setupListeners
  }

  reset(): void {
    this.stopAll();
  }

  destroy(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioEngine = new AudioEngine();
