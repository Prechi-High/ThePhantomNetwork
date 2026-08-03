/**
 * AudioRegistry — Kenney cue library + state audio profiles
 */

import type { AudioCategory, AudioCueDef, AudioStateProfile, LegacyAudioLayer, MotionState } from "./types";

function cue(
  id: string,
  path: string,
  category: AudioCategory,
  legacyLayer: LegacyAudioLayer,
  volume: number,
  opts: Partial<AudioCueDef> = {}
): AudioCueDef {
  const channel =
    legacyLayer === "ui"
      ? "ui"
      : legacyLayer === "music"
        ? "music"
        : legacyLayer === "voice"
          ? "voice"
          : legacyLayer === "ambient" || legacyLayer === "environment"
            ? "ambient"
            : "gameplay";

  return {
    id,
    path,
    channel,
    category,
    legacyLayer,
    volume,
    pitchVariance: 0.05,
    volumeVariance: 0.1,
    ...opts,
  };
}

export const AUDIO_CUE_REGISTRY: Record<string, AudioCueDef> = {
  spin_start: cue("spin_start", "/audio/wheel/spin-start.ogg", "gameplay", "mechanical", 0.75),
  spin_loop: cue("spin_loop", "/audio/wheel/spin-loop.ogg", "gameplay", "mechanical", 0.5, { loop: true, fadeIn: 200 }),
  spin_brake: cue("spin_brake", "/audio/wheel/spin-slowdown.ogg", "gameplay", "mechanical", 0.7),
  spin_lock: cue("spin_lock", "/audio/wheel/spin-stop.ogg", "gameplay", "mechanical", 0.9),
  needle_tick: cue("needle_tick", "/audio/wheel/token-tick.ogg", "gameplay", "mechanical", 0.35),
  energy_charge: cue("energy_charge", "/audio/wheel/energy-charge.ogg", "gameplay", "mechanical", 0.6),

  reveal_burst: cue("reveal_burst", "/audio/wheel/reveal-burst.ogg", "rewards", "reward", 0.8),
  outcome_advance: cue("outcome_advance", "/audio/wheel/outcome-advance.ogg", "rewards", "reward", 0.95),
  outcome_acquire: cue("outcome_acquire", "/audio/wheel/outcome-acquire.ogg", "rewards", "reward", 0.85),
  outcome_discover: cue("outcome_discover", "/audio/wheel/outcome-discover.ogg", "rewards", "reward", 0.75),
  outcome_steal: cue("outcome_steal", "/audio/wheel/outcome-steal.ogg", "rewards", "reward", 0.9),
  outcome_void: cue("outcome_void", "/audio/wheel/outcome-void.ogg", "rewards", "reward", 0.6),
  tokens_complete: cue("tokens_complete", "/audio/wheel/tokens-complete.ogg", "rewards", "reward", 0.7),

  steal_activate: cue("steal_activate", "/audio/combat/steal-activate.ogg", "combat", "combat", 0.85),
  shield_hit: cue("shield_hit", "/audio/combat/shield-hit.ogg", "combat", "combat", 0.8),
  revive_start: cue("revive_start", "/audio/combat/revive-start.ogg", "combat", "combat", 0.7),
  revive_complete: cue("revive_complete", "/audio/combat/revive-complete.ogg", "combat", "combat", 0.9),
  steal_ready: cue("steal_ready", "/audio/combat/steal-ready.ogg", "combat", "combat", 0.9),
  guardian_arm: cue("guardian_arm", "/audio/combat/guardian-arm.ogg", "combat", "combat", 0.7),
  guardian_hum: cue("guardian_hum", "/audio/combat/guardian-hum.ogg", "combat", "combat", 0.35, { loop: true, fadeIn: 400 }),
  guardian_block: cue("guardian_block", "/audio/combat/guardian-block.ogg", "combat", "combat", 0.85),
  cloak_active: cue("cloak_active", "/audio/combat/cloak-active.ogg", "combat", "combat", 0.65),
  insurance_pulse: cue("insurance_pulse", "/audio/ambient/heartbeat.ogg", "combat", "combat", 0.7),

  rank_up: cue("rank_up", "/audio/reward/rank-up.ogg", "rewards", "reward", 0.85),
  rank_down: cue("rank_down", "/audio/reward/rank-down.ogg", "rewards", "reward", 0.7),
  legacy_forged: cue("legacy_forged", "/audio/reward/legacy-forged.ogg", "victory", "reward", 1.0),
  phase_end: cue("phase_end", "/audio/ambient/phase-end.ogg", "transitions", "environment", 0.95),
  elimination_fade: cue("elimination_fade", "/audio/ambient/elimination-fade.ogg", "ambient", "ambient", 0.6, { fadeOut: 3000 }),

  button_tap: cue("button_tap", "/audio/ui/button-tap.ogg", "ui", "ui", 0.5),
  ui_button_press: cue("ui_button_press", "/audio/ui/button-tap.ogg", "ui", "ui", 0.55),
  hud_tick: cue("hud_tick", "/audio/ui/hud-tick.ogg", "ui", "ui", 0.3),
  token_tick: cue("token_tick", "/audio/ui/hud-tick.ogg", "ui", "ui", 0.35),

  arena_hum: cue("arena_hum", "/audio/ambient/arena-idle.ogg", "ambient", "ambient", 0.25, { loop: true, fadeIn: 2000 }),
  wheel_idle_hum: cue("wheel_idle_hum", "/audio/ambient/wheel-idle.ogg", "ambient", "ambient", 0.2, { loop: true, fadeIn: 1500 }),
  home_wind: cue("home_wind", "/audio/ambient/wind.ogg", "ambient", "ambient", 0.18, { loop: true, fadeIn: 3000 }),
  home_thunder: cue("home_thunder", "/audio/ambient/thunder.ogg", "ambient", "environment", 0.15),
  home_crackle: cue("home_crackle", "/audio/ambient/energy-crackle.ogg", "ambient", "ambient", 0.12),
  banner_cloth: cue("banner_cloth", "/audio/ambient/banner-cloth.ogg", "ambient", "ambient", 0.2, { loop: true, fadeIn: 1500 }),
  heartbeat: cue("heartbeat", "/audio/ambient/heartbeat.ogg", "combat", "combat", 0.65),

  countdown_tick: cue("countdown_tick", "/audio/countdown/tick-deep.ogg", "countdown", "ui", 0.6),
  countdown_go: cue("countdown_go", "/audio/countdown/go-burst.ogg", "countdown", "reward", 1.0),
  purchase_burst: cue("purchase_burst", "/audio/wheel/outcome-acquire.ogg", "rewards", "reward", 0.9),
  prestige_sweep: cue("prestige_sweep", "/audio/ui/prestige-tone.ogg", "ui", "ui", 0.4),
  victory_orchestra: cue("victory_orchestra", "/audio/victory/orchestra-hit.ogg", "victory", "reward", 1.0),
  victory_choir: cue("victory_choir", "/audio/victory/choir-pad.ogg", "victory", "music", 0.7, { loop: false, fadeIn: 400 }),
};

export const AUDIO_STATE_PROFILES: Partial<Record<MotionState, AudioStateProfile>> = {
  Idle: {
    enter: [],
    exit: [{ stop: "wheel_idle_hum", fadeOut: 400 }, { stop: "arena_hum", fadeOut: 400 }],
  },
  SpinStart: {
    enter: [{ play: "spin_start" }, { play: "energy_charge" }],
    exit: [{ stop: "wheel_idle_hum", fadeOut: 200 }],
  },
  Spinning: {
    enter: [{ play: "spin_loop" }],
    exit: [{ stop: "spin_start", fadeOut: 150 }],
  },
  SpinSlowdown: {
    enter: [{ play: "spin_brake" }],
    exit: [{ stop: "spin_loop", fadeOut: 300 }],
  },
  RewardReveal: {
    enter: [{ play: "reveal_burst" }],
    exit: [{ stop: "spin_brake", fadeOut: 200 }, { stop: "spin_lock", fadeOut: 100 }],
  },
  Advance: { enter: [{ play: "outcome_advance" }], exit: [] },
  Acquire: { enter: [{ play: "outcome_acquire" }], exit: [] },
  Discover: { enter: [{ play: "outcome_discover" }], exit: [] },
  Steal: { enter: [{ play: "outcome_steal" }, { play: "steal_activate" }], exit: [] },
  Void: { enter: [{ play: "outcome_void" }], exit: [] },
  GuardianActivated: {
    enter: [{ play: "guardian_arm" }, { play: "guardian_hum" }],
    exit: [{ stop: "guardian_hum", fadeOut: 800 }],
  },
  Cloak: { enter: [{ play: "cloak_active" }], exit: [] },
  Insurance: { enter: [{ play: "insurance_pulse" }], exit: [] },
  Revive: { enter: [{ play: "revive_start" }], exit: [] },
  Countdown: { enter: [{ play: "countdown_tick" }], exit: [] },
  CountdownGo: { enter: [{ play: "countdown_go" }], exit: [] },
  Victory: { enter: [{ play: "victory_orchestra" }, { play: "victory_choir" }, { play: "legacy_forged" }], exit: [] },
  Elimination: { enter: [{ play: "elimination_fade" }], exit: [] },
};

export function getAudioCue(id: string): AudioCueDef | undefined {
  return AUDIO_CUE_REGISTRY[id];
}
