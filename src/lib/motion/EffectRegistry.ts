/**
 * EffectRegistry — maps effect IDs to all motion layers
 */

import type { EffectDef, MotionState, ScreenId } from "./types";

export const EFFECT_REGISTRY: Record<string, EffectDef> = {
  spin_request: { id: "spin_request", state: "SpinStart", sounds: ["spin_start", "energy_charge"], motion: "wheel_spin", visualFx: ["glow"] },
  spin_acceleration: { id: "spin_acceleration", state: "Spinning", sounds: ["spin_loop"], motion: "wheel_glow", particles: ["energy_pulse"] },
  spin_brake: { id: "spin_brake", state: "SpinSlowdown", sounds: ["spin_brake"] },
  spin_lock: { id: "spin_lock", state: "SpinSlowdown", sounds: ["spin_lock"], visualFx: ["lightning", "shockwave"] },
  reveal_start: { id: "reveal_start", state: "RewardReveal", sounds: ["reveal_burst"], motion: "reveal_burst", particles: ["golden_shards"], visualFx: ["shockwave"] },

  advance: { id: "advance", state: "Advance", sounds: ["outcome_advance"], motion: "advance_rays", particles: ["golden_shards"], visualFx: ["glow"] },
  acquire: { id: "acquire", state: "Acquire", sounds: ["outcome_acquire"], motion: "acquire_burst", particles: ["coin_burst"], visualFx: ["glow"] },
  discover: { id: "discover", state: "Discover", sounds: ["outcome_discover"], motion: "discover_ripple", particles: ["blue_wisps"], visualFx: ["pulse"] },
  steal: { id: "steal", state: "Steal", sounds: ["outcome_steal", "steal_activate"], motion: "steal_slash", particles: ["shadow_extract"], visualFx: ["slash", "motionBlur"] },
  void: { id: "void", state: "Void", sounds: ["outcome_void"], motion: "void_collapse", particles: ["dark_smoke"], visualFx: ["desaturate"] },

  tokens_complete: { id: "tokens_complete", sounds: ["tokens_complete"] },
  token_collected: { id: "token_collected", sounds: ["token_tick"] },
  steal_executed: { id: "steal_executed", state: "Steal", sounds: ["steal_activate"] },
  shield_triggered: { id: "shield_triggered", sounds: ["guardian_block"], visualFx: ["shield"] },

  guardian: { id: "guardian", state: "GuardianActivated", sounds: ["guardian_arm"], motion: "guardian", particles: ["shield_pulse"], visualFx: ["shield", "glow"] },
  guardian_activate: { id: "guardian_activate", state: "GuardianActivated", sounds: ["guardian_arm"], motion: "guardian", particles: ["shield_pulse"] },
  cloak: { id: "cloak", state: "Cloak", sounds: ["cloak_active"], motion: "cloak", particles: ["purple_smoke"], visualFx: ["blur"] },
  insurance: { id: "insurance", state: "Insurance", sounds: ["insurance_pulse"], motion: "insurance", visualFx: ["pulse"] },
  revive_start: { id: "revive_start", state: "Revive", sounds: ["revive_start"], motion: "revive", particles: ["revive_sparkles"] },
  revive_complete: { id: "revive_complete", sounds: ["revive_complete"], particles: ["revive_sparkles"] },
  elimination: { id: "elimination", state: "Elimination", sounds: ["elimination_fade"], particles: ["dark_smoke"] },

  ui_button_press: { id: "ui_button_press", sounds: ["ui_button_press"], motion: "button", haptic: "light" },
  countdown_tick: { id: "countdown_tick", state: "Countdown", sounds: ["countdown_tick"], motion: "countdown", particles: ["countdown_spark"], visualFx: ["glow"] },
  countdown_go: { id: "countdown_go", state: "CountdownGo", sounds: ["countdown_go"], motion: "victory", particles: ["victory_burst", "energy_pulse"], visualFx: ["shockwave", "lightning"] },
  victory: { id: "victory", state: "Victory", sounds: ["victory_orchestra", "legacy_forged"], motion: "victory", particles: ["victory_burst", "golden_shards"], visualFx: ["glow"] },
  purchase_complete: { id: "purchase_complete", sounds: ["purchase_burst"], particles: ["coin_burst"], visualFx: ["glow"] },
  prestige_sweep: { id: "prestige_sweep", sounds: ["prestige_sweep"], visualFx: ["glow"] },

  wheel_idle: { id: "wheel_idle", state: "Idle" },
};

export const SCREEN_AUDIO: Record<ScreenId, string[]> = {
  home: ["home_wind"],
  shop: ["arena_hum"],
  profile: ["home_wind"],
  camp: ["home_wind", "banner_cloth"],
  squad: ["arena_hum"],
  leaderboard: ["arena_hum"],
  world: ["home_wind", "home_crackle"],
  play: [],
  results: ["legacy_forged"],
  countdown: [],
};

export function getEffect(id: string): EffectDef | undefined {
  return EFFECT_REGISTRY[id];
}

export function getScreenEffect(screen: ScreenId): EffectDef {
  return {
    id: `screen_${screen}`,
    sounds: SCREEN_AUDIO[screen] ?? [],
    particles: [],
  };
}
