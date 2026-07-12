/**
 * Gameplay Engines Index
 * 
 * Exports all gameplay engines for the runtime.
 * Each engine owns a specific domain of gameplay logic.
 */

export { spinEngine, SpinEngine } from './spin-engine';
export { effectsEngine, EffectsEngine } from './effects-engine';
export { worldEngine, WorldEngine } from './world-engine';
export { audioEngine, AudioEngine } from './audio-engine';
export { combatEngine, CombatEngine } from './combat-engine';
export { animationEngine, AnimationEngine } from './animation-engine';
export { rewardEngine, RewardEngine } from './reward-engine';

// Engine types
export type { SpinConfig } from './spin-engine';
export type { ActiveEffect } from './effects-engine';
export type { LiveFeedEvent, LeaderboardEntry, SquadMember } from './world-engine';
export type { AudioTrack } from './audio-engine';
