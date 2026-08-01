/**
 * Gameplay bootstrap — wire runtime, engines, and store bridge once per session.
 */

import { gameplayRuntime } from "./runtime";
import { spinEngine } from "./engines/spin-engine";
import { combatEngine } from "./engines/combat-engine";
import { effectsEngine } from "./engines/effects-engine";
import { animationEngine } from "./engines/animation-engine";
import { audioEngine } from "./engines/audio-engine";
import { initGameplayStoreBridge } from "./store-bridge";

let initializedFor: string | null = null;

export function initGameplaySystems(sessionId: string, subSessionId: string): () => void {
  if (initializedFor === subSessionId) {
    return () => {};
  }

  if (initializedFor) {
    gameplayRuntime.reset();
  }

  initializedFor = subSessionId;
  const cleanupBridge = initGameplayStoreBridge();

  gameplayRuntime.registerEngine("spin", spinEngine);
  gameplayRuntime.registerEngine("combat", combatEngine);
  gameplayRuntime.registerEngine("effects", effectsEngine);
  gameplayRuntime.registerEngine("animation", animationEngine);
  gameplayRuntime.registerEngine("audio", audioEngine);

  gameplayRuntime.initialize(sessionId, subSessionId);
  gameplayRuntime.transitionTo("READY", "Session booted");

  return () => {
    cleanupBridge();
    gameplayRuntime.reset();
    initializedFor = null;
  };
}

export function getGameplaySubSessionId(): string | null {
  return gameplayRuntime.getState().subSessionId;
}
