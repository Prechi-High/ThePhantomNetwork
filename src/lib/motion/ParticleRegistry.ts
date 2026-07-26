/**
 * ParticleRegistry — tsParticles + canvas burst presets
 */

import type { ParticlePresetDef, ScreenId } from "./types";

export const PARTICLE_REGISTRY: Record<string, ParticlePresetDef> = {
  fog: { id: "fog", engine: "tsparticles", preset: "fog", density: 0.4, colors: ["#6b21a8", "#1e1b4b"] },
  embers: { id: "embers", engine: "tsparticles", preset: "embers", density: 0.6, colors: ["#f59e0b", "#ef4444"] },
  dust: { id: "dust", engine: "tsparticles", preset: "dust", density: 0.3, colors: ["#a78bfa", "#6366f1"] },
  magic_sparks: { id: "magic_sparks", engine: "tsparticles", preset: "sparkle", density: 0.5, colors: ["#c084fc", "#818cf8"] },
  lightning: { id: "lightning", engine: "canvas", preset: "lightning", colors: ["#e9d5ff", "#ffffff"] },
  golden_shards: { id: "golden_shards", engine: "canvas", preset: "shardBurst", colors: ["#f59e0b", "#fcd34d"] },
  blue_wisps: { id: "blue_wisps", engine: "canvas", preset: "wisp", colors: ["#3b82f6", "#93c5fd"] },
  coin_burst: { id: "coin_burst", engine: "canvas", preset: "coin", colors: ["#eab308", "#fde68a"] },
  dark_smoke: { id: "dark_smoke", engine: "canvas", preset: "smoke", colors: ["#374151", "#1f2937"] },
  shadow_extract: { id: "shadow_extract", engine: "canvas", preset: "shadow", colors: ["#ef4444", "#7f1d1d"] },
  shield_pulse: { id: "shield_pulse", engine: "canvas", preset: "ring", colors: ["#f59e0b", "#fcd34d"] },
  purple_smoke: { id: "purple_smoke", engine: "canvas", preset: "smoke", colors: ["#7c3aed", "#4c1d95"] },
  revive_sparkles: { id: "revive_sparkles", engine: "canvas", preset: "sparkle", colors: ["#fbbf24", "#fef3c7"] },
  countdown_spark: { id: "countdown_spark", engine: "canvas", preset: "spark", colors: ["#a855f7", "#ffffff"] },
  victory_burst: { id: "victory_burst", engine: "canvas", preset: "burst", colors: ["#f59e0b", "#fcd34d", "#ffffff"] },
  energy_pulse: { id: "energy_pulse", engine: "canvas", preset: "pulse", colors: ["#8b5cf6", "#c084fc"] },
};

export const SCREEN_AMBIENCE: Record<ScreenId, string[]> = {
  home: ["fog", "embers", "magic_sparks"],
  shop: ["magic_sparks", "dust"],
  profile: ["dust", "energy_pulse"],
  camp: ["fog", "dust"],
  squad: ["energy_pulse", "magic_sparks"],
  leaderboard: ["golden_shards", "dust"],
  world: ["fog", "embers"],
  play: ["energy_pulse", "dust"],
  results: ["golden_shards", "victory_burst"],
  countdown: ["countdown_spark", "energy_pulse"],
};

export function getParticlePreset(id: string): ParticlePresetDef | undefined {
  return PARTICLE_REGISTRY[id];
}
