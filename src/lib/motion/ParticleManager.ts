/**
 * ParticleManager — tsParticles + canvas burst layer
 */

import { getParticlePreset } from "./ParticleRegistry";
import { particleOrchestrator } from "@/lib/experience/particleOrchestrator";

/** Maps motion particle preset IDs → particleOrchestrator library keys */
const PRESET_TO_ORCHESTRATOR: Record<string, string | string[]> = {
  golden_shards: "advance_burst",
  blue_wisps: "discover_wisps",
  coin_burst: "acquire_coins",
  dark_smoke: "void_dust",
  shadow_extract: ["steal_smoke", "steal_sparks"],
  shield_pulse: "revive_ripple",
  purple_smoke: "steal_smoke",
  revive_sparkles: "revive_ripple",
  countdown_spark: "token_tick",
  victory_burst: "championship_burst",
  energy_pulse: "discover_wisps",
  lightning: "steal_sparks",
  spark: "token_tick",
  burst: "championship_burst",
  sparkle: "advance_burst",
  pulse: "discover_wisps",
  smoke: "void_dust",
  ring: "revive_ripple",
  wisp: "discover_wisps",
  shardBurst: "advance_burst",
  coin: "acquire_coins",
};

export class ParticleManager {
  private initialized = false;
  private paused = false;
  private qualityMultiplier = 1;

  initialize(): void {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    document.addEventListener("visibilitychange", () => {
      this.paused = document.hidden;
    });
  }

  emit(presetId: string): void {
    if (this.paused) return;
    const preset = getParticlePreset(presetId);
    if (!preset) return;

    if (preset.engine === "canvas") {
      const mapped = PRESET_TO_ORCHESTRATOR[preset.preset] ?? PRESET_TO_ORCHESTRATOR[presetId];
      if (!mapped) return;
      if (Array.isArray(mapped)) {
        particleOrchestrator.emitGroup(mapped);
      } else {
        particleOrchestrator.emit(mapped);
      }
    }
  }

  emitGroup(presetIds: string[]): void {
    presetIds.forEach((id) => this.emit(id));
  }

  clearAll(): void {
    particleOrchestrator.clearAll();
  }

  applyQualityTier(tier: "ultra" | "high" | "medium" | "low" | "minimal"): void {
    this.qualityMultiplier =
      tier === "minimal" ? 0 : tier === "low" ? 0.25 : tier === "medium" ? 0.5 : tier === "high" ? 0.8 : 1;
    particleOrchestrator.setQuality(this.qualityMultiplier);
  }
}

export const particleManager = new ParticleManager();
