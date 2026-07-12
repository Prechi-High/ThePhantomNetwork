/**
 * ============================================================================
 * EXPERIENCE ENGINE — The Sensory Coordinator
 * ============================================================================
 *
 * One engine to coordinate all player-facing feedback systems.
 * Nothing animates, plays, or vibrates independently.
 * Everything flows through here, on one global timeline.
 *
 * Systems coordinated:
 *   - ExperienceTimeline  (priority queue)
 *   - CameraSystem        (micro camera reactions)
 *   - LightingEngine      (emotional ambient lighting)
 *   - ParticleOrchestrator (reusable particle bursts)
 *   - AudioLayerController (layered sound mixing)
 *   - ScreenFXController  (full-screen effects)
 *   - HapticsController   (mobile vibration)
 *   - QualityManager      (device-tier scaling)
 *   - MotionLanguage      (animation vocabulary)
 *
 * Every gameplay event maps to an Experience.
 * An Experience = Timeline + Particles + Audio + Camera + Lighting + Haptics
 *
 * Usage:
 *   experienceEngine.trigger("advance", { tokenDelta: 3 });
 *   experienceEngine.trigger("steal");
 *   experienceEngine.trigger("championship");
 * ============================================================================
 */

import { experienceTimeline, type TimelinePriority } from "./timeline";
import { cameraSystem, type CameraReaction }          from "./cameraSystem";
import { lightingEngine, type LightingState }         from "./lightingEngine";
import { particleOrchestrator }                       from "./particleOrchestrator";
import { audioLayerController, type MusicIntensity }  from "./audioLayer";
import { screenFX, type ScreenFXType }                from "./screenFX";
import { haptics, GAMEPLAY_HAPTICS }                  from "./haptics";
import { qualityManager }                             from "./qualityManager";
import { getMotionPreset, type GameplayEventMotion }  from "./motionLanguage";
import { gameplayEvents }                             from "@/lib/gameplay/events";
import type { SpinOutcome }                           from "@/types/gameplay";

// ── Experience definition ──────────────────────────────────────────────────

interface ExperienceDef {
  priority:      TimelinePriority;
  durationMs:    number;
  exclusive?:    boolean;
  camera?:       CameraReaction;
  lighting?:     LightingState;
  lightingReset?: boolean;
  lightingResetDelayMs?: number;
  particles?:    string[];
  audio?:        string[];
  stopAudio?:    string[];
  screenFx?:     ScreenFXType;
  haptic?:       string;
  musicIntensity?: MusicIntensity;
}

// ── Experience library ────────────────────────────────────────────────────

const EXPERIENCES: Record<string, ExperienceDef> = {

  // ---- Spin lifecycle ----
  spin_request: {
    priority:  "gameplay",
    durationMs: 200,
    audio:     ["spin_start"],
    haptic:    "engage",
  },
  spin_acceleration: {
    priority:  "gameplay",
    durationMs: 300,
    camera:    "none",
    musicIntensity: "building",
  },
  spin_brake: {
    priority:  "gameplay",
    durationMs: 800,
    audio:     ["spin_brake"],
    camera:    "none",
  },
  spin_lock: {
    priority:  "gameplay",
    durationMs: 500,
    audio:     ["spin_lock"],
    camera:    "punch",
    haptic:    "spin_lock",
  },

  // ---- Reveal (exclusive — everything else yields) ----
  reveal_start: {
    priority:   "reveal",
    durationMs: 300,
    exclusive:  true,
    audio:      ["reveal_burst"],
    screenFx:   "none",
    musicIntensity: "tension",
  },

  // ---- Outcome experiences ----
  advance: {
    priority:   "reveal",
    durationMs: 2500,
    exclusive:  true,
    camera:     "punch",
    lighting:   "reveal_advance",
    lightingReset: true,
    lightingResetDelayMs: 3000,
    particles:  ["advance_burst"],
    audio:      ["outcome_advance"],
    screenFx:   "golden_bloom",
    haptic:     "reveal_advance",
    musicIntensity: "active",
  },
  acquire: {
    priority:   "reveal",
    durationMs: 2000,
    exclusive:  true,
    camera:     "punch",
    lighting:   "reveal_acquire",
    lightingReset: true,
    lightingResetDelayMs: 2500,
    particles:  ["acquire_coins"],
    audio:      ["outcome_acquire"],
    screenFx:   "golden_bloom",
    haptic:     "reveal_acquire",
    musicIntensity: "active",
  },
  discover: {
    priority:   "reveal",
    durationMs: 1800,
    exclusive:  true,
    camera:     "none",
    lighting:   "reveal_discover",
    lightingReset: true,
    lightingResetDelayMs: 2000,
    particles:  ["discover_wisps"],
    audio:      ["outcome_discover"],
    haptic:     "reveal_discover",
    musicIntensity: "building",
  },
  steal: {
    priority:   "steal",
    durationMs: 2000,
    exclusive:  true,
    camera:     "shake",
    lighting:   "reveal_steal",
    lightingReset: true,
    lightingResetDelayMs: 4000,
    particles:  ["steal_smoke", "steal_sparks"],
    audio:      ["outcome_steal", "steal_activate"],
    screenFx:   "red_slash",
    haptic:     "reveal_steal",
    musicIntensity: "tension",
  },
  void: {
    priority:   "reveal",
    durationMs: 1200,
    exclusive:  true,
    camera:     "none",
    lighting:   "reveal_void",
    lightingReset: true,
    lightingResetDelayMs: 1500,
    particles:  ["void_dust"],
    audio:      ["outcome_void"],
    screenFx:   "dark_vignette",
    haptic:     "reveal_void",
    musicIntensity: "calm",
  },

  // ---- Token collection ----
  token_collected: {
    priority:   "hud",
    durationMs: 350,
    particles:  ["token_tick"],
    audio:      [],
    haptic:     "token_collected",
  },
  tokens_complete: {
    priority:   "hud",
    durationMs: 400,
    audio:      ["tokens_complete"],
    haptic:     "token_collected",
  },

  // ---- Combat ----
  steal_executed: {
    priority:   "steal",
    durationMs: 800,
    camera:     "shake",
    lighting:   "reveal_steal",
    lightingReset: true,
    lightingResetDelayMs: 1200,
    audio:      ["steal_activate"],
    screenFx:   "red_slash",
    haptic:     "steal_executed",
    musicIntensity: "tension",
  },
  shield_triggered: {
    priority:   "gameplay",
    durationMs: 700,
    audio:      ["shield_hit"],
    screenFx:   "shield_ripple",
    haptic:     "shield_triggered",
  },
  insurance_triggered: {
    priority:   "gameplay",
    durationMs: 600,
    screenFx:   "golden_sweep",
    haptic:     "shield_triggered",
  },
  fire_boost_activate: {
    priority:   "gameplay",
    durationMs: 400,
    screenFx:   "heat_distortion",
    haptic:     "engage",
  },

  // ---- Revive ----
  revive_start: {
    priority:   "revive",
    durationMs: 1200,
    camera:     "zoom_in",
    lighting:   "revive",
    audio:      ["revive_start"],
    particles:  ["revive_ripple"],
    haptic:     "revive_sequence",
    musicIntensity: "building",
  },
  revive_complete: {
    priority:   "revive",
    durationMs: 1500,
    exclusive:  true,
    camera:     "zoom_out",
    lighting:   "revive",
    lightingReset: true,
    lightingResetDelayMs: 2000,
    audio:      ["revive_complete"],
    screenFx:   "white_flash",
    haptic:     "revive_complete",
    musicIntensity: "active",
  },

  // ---- Championship ----
  championship_start: {
    priority:   "championship",
    durationMs: 2500,
    exclusive:  true,
    camera:     "wider",
    lighting:   "championship",
    particles:  ["championship_burst"],
    screenFx:   "championship_flare",
    haptic:     "championship",
    musicIntensity: "peak",
  },

  // ---- Elimination ----
  elimination: {
    priority:   "gameplay",
    durationMs: 1500,
    camera:     "none",
    lighting:   "elimination",
    lightingReset: true,
    lightingResetDelayMs: 3000,
    haptic:     "elimination",
    musicIntensity: "calm",
  },
};

// ── Experience Engine ─────────────────────────────────────────────────────

export class ExperienceEngineClass {
  private initialized = false;
  private subscriptions: Array<() => void> = [];

  /** Mount DOM elements for camera and screen FX overlays */
  initialize(rootElement: HTMLElement, fxOverlay: HTMLElement, lightingOverlay: HTMLElement): void {
    if (this.initialized) return;
    this.initialized = true;

    // Mount subsystems
    cameraSystem.mount(rootElement);
    screenFX.mount(fxOverlay);
    lightingEngine.mount(lightingOverlay);

    // Detect quality tier
    qualityManager.detect();

    // Apply quality to particles
    qualityManager.onChange((profile) => {
      particleOrchestrator.setQuality(profile.particleMultiplier);
    });

    // Subscribe to gameplay events → auto-trigger experiences
    this.wireGameplayEvents();

    // Initialize audio (needs first user gesture but set up structure now)
    audioLayerController.initialize();

    console.log("[ExperienceEngine] Initialized");
  }

  /** Destroy and clean up all systems */
  destroy(): void {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
    cameraSystem.unmount();
    screenFX.unmount();
    lightingEngine.unmount();
    audioLayerController.stopAll(300);
    particleOrchestrator.clearAll();
    experienceTimeline.clear();
    haptics.cancel();
    this.initialized = false;
  }

  // ── Trigger an experience ────────────────────────────────────────────────

  trigger(experienceId: string, _context?: Record<string, unknown>): void {
    const def = EXPERIENCES[experienceId];
    if (!def) return;

    const quality = qualityManager.getProfile();

    // Enqueue on global timeline
    experienceTimeline.enqueue({
      id: `exp-${experienceId}-${Date.now()}`,
      priority: def.priority,
      durationMs: def.durationMs,
      exclusive: def.exclusive,
      onStart: () => this.executeExperience(def, quality),
    });
  }

  private executeExperience(def: ExperienceDef, quality: ReturnType<typeof qualityManager.getProfile>): void {
    // Camera
    if (def.camera && def.camera !== "none" && quality.cameraEnabled) {
      cameraSystem.trigger(def.camera);
    }

    // Lighting
    if (def.lighting && quality.lightingEnabled) {
      lightingEngine.transition(def.lighting);
      if (def.lightingReset) {
        lightingEngine.returnToIdle(def.lightingResetDelayMs ?? 2000);
      }
    }

    // Particles
    if (def.particles && quality.particleMultiplier > 0) {
      particleOrchestrator.emitGroup(def.particles);
    }

    // Audio
    if (def.audio) {
      def.audio.forEach((cueId) => audioLayerController.play(cueId));
    }
    if (def.stopAudio) {
      def.stopAudio.forEach((cueId) => audioLayerController.stop(cueId, 200));
    }

    // Screen FX
    if (def.screenFx && def.screenFx !== "none" && quality.screenFxEnabled) {
      screenFX.trigger(def.screenFx);
    }

    // Haptics
    if (def.haptic) {
      const pattern = GAMEPLAY_HAPTICS[def.haptic];
      if (pattern) haptics.trigger(pattern);
    }

    // Music intensity
    if (def.musicIntensity) {
      audioLayerController.setMusicIntensity(def.musicIntensity);
    }
  }

  // ── Wire gameplay events automatically ──────────────────────────────────

  private wireGameplayEvents(): void {
    const on = (type: Parameters<typeof gameplayEvents.on>[0], handler: Parameters<typeof gameplayEvents.on>[1]) => {
      const unsub = gameplayEvents.on(type, handler);
      this.subscriptions.push(unsub);
    };

    on("SPIN_REQUESTED",          () => this.trigger("spin_request"));
    on("SPIN_ACCELERATION",       () => this.trigger("spin_acceleration"));
    on("SPIN_DECELERATION",       () => this.trigger("spin_brake"));
    on("SPIN_POINTER_LOCK",       () => this.trigger("spin_lock"));
    on("REVEAL_STARTED",          () => this.trigger("reveal_start"));
    on("TOKEN_COLLECTED",         () => this.trigger("token_collected"));
    on("TOKEN_COLLECTION_COMPLETED", () => this.trigger("tokens_complete"));
    on("STEAL_ACTIVATED",         () => this.trigger("steal_executed"));
    on("EFFECT_TRIGGERED",        () => this.trigger("shield_triggered"));
    on("REVIVE_TRIGGERED",        () => this.trigger("revive_start"));
    on("REVIVE_COMPLETED",        () => this.trigger("revive_complete"));

    on("OUTCOME_RECEIVED", (event) => {
      const payload = event.payload as { outcome?: SpinOutcome } | undefined;
      const outcome = payload?.outcome;
      if (outcome) {
        const id = outcome.toLowerCase() as Lowercase<SpinOutcome>;
        this.trigger(id);
      }
    });

    on("PHASE_STARTED", (event) => {
      const payload = event.payload as { phase?: number } | undefined;
      if (payload?.phase && payload.phase >= 5) {
        this.trigger("championship_start");
      }
    });
  }

  // ── Audio controls ──────────────────────────────────────────────────────

  setMasterVolume(v: number): void { audioLayerController.setMasterVolume(v); }
  setMute(mute: boolean): void {
    audioLayerController.setMute(mute);
    haptics.setEnabled(!mute);
  }

  // ── Quality override ────────────────────────────────────────────────────

  setQuality(tier: Parameters<typeof qualityManager.setTier>[0]): void {
    qualityManager.setTier(tier);
    particleOrchestrator.setQuality(qualityManager.getProfile().particleMultiplier);
  }

  // ── Debug ───────────────────────────────────────────────────────────────

  getDebugInfo() {
    return {
      quality:    qualityManager.getTier(),
      timeline:   experienceTimeline.debugSnapshot(),
      lighting:   lightingEngine.getCurrentState(),
      particles:  particleOrchestrator.getActiveBursts().length,
      haptics:    haptics.isEnabled(),
      initialized: this.initialized,
    };
  }
}

export const experienceEngine = new ExperienceEngineClass();
