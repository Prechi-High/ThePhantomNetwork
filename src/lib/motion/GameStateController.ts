/**
 * GameStateController — tracks active screen, phase, session mode
 */

import { SCREEN_AMBIENCE } from "./ParticleRegistry";
import { SCREEN_AUDIO } from "./EffectRegistry";
import { audioManager } from "./AudioManager";
import { particleManager } from "./ParticleManager";
import type { ScreenId } from "./types";

export class GameStateController {
  private currentScreen: ScreenId | null = null;
  private phase = 1;

  getScreen(): ScreenId | null {
    return this.currentScreen;
  }

  getPhase(): number {
    return this.phase;
  }

  setScreen(screen: ScreenId): void {
    if (this.currentScreen === screen) return;
    this.stopScreenAmbience();
    this.currentScreen = screen;
    this.startScreenAmbience(screen);
  }

  setPhase(phase: number): void {
    this.phase = phase;
    const intensity =
      phase >= 5 ? "peak" : phase >= 4 ? "tension" : phase >= 3 ? "active" : phase >= 2 ? "building" : "calm";
    audioManager.setMusicIntensity(intensity);
  }

  private startScreenAmbience(screen: ScreenId): void {
    const particles = SCREEN_AMBIENCE[screen] ?? [];
    const audio = SCREEN_AUDIO[screen] ?? [];
    audio.forEach((cue) => audioManager.play(cue));
    particles.forEach((p) => {
      particleManager.emit(p);
    });
  }

  private stopScreenAmbience(): void {
    audioManager.stopChannel("ambient", 600);
  }
}

export const gameStateController = new GameStateController();
