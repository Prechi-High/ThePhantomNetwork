/**
 * InteractionController — single entry point for all motion FX
 */

import { EFFECT_REGISTRY, getEffect } from "./EffectRegistry";
import { motionManager } from "./MotionManager";
import { particleManager } from "./ParticleManager";
import { audioManager } from "./AudioManager";
import { visualEffectManager } from "./VisualEffectManager";
import { hapticManager } from "./HapticManager";
import { experienceStateMachine } from "./ExperienceStateMachine";
import { audioStateMachine } from "./AudioStateMachine";
import { gameStateController } from "./GameStateController";
import { screenTransitionManager } from "./ScreenTransitionManager";
import { gameplayEvents } from "@/lib/gameplay/events";
import { appEvents } from "@/lib/motion/appEvents";
import type { MotionState, PlayEffectInput, ScreenId } from "./types";
import type { TransitionType } from "./ScreenTransitionManager";

const OUTCOME_TO_STATE: Record<string, MotionState> = {
  ADVANCE: "Advance", ACQUIRE: "Acquire", DISCOVER: "Discover", STEAL: "Steal", VOID: "Void",
  advance: "Advance", acquire: "Acquire", discover: "Discover", steal: "Steal", void: "Void",
};

export class InteractionControllerClass {
  private wired = false;
  private unsubscribers: Array<() => void> = [];

  initialize(): void {
    if (this.wired || typeof window === "undefined") return;
    this.wired = true;

    audioManager.initialize();
    particleManager.initialize();
    audioStateMachine.bind((sub) => experienceStateMachine.subscribe(sub));
    this.wireGameplayEvents();
    this.wireAppEvents();
  }

  destroy(): void {
    this.unsubscribers.forEach((u) => u());
    this.unsubscribers = [];
    audioManager.stopAll(200);
    particleManager.clearAll();
    motionManager.killAll();
    experienceStateMachine.reset();
    this.wired = false;
  }

  playEffect(input: PlayEffectInput): void {
    this.initialize();

    const def = typeof input === "string" ? getEffect(input) : input;
    const effectId = typeof input === "string" ? input : input.id;
    const bundle = (typeof input === "string" ? def : { ...EFFECT_REGISTRY[input.id ?? ""], ...input }) as {
      state?: MotionState;
      sounds?: string[];
      motion?: string;
      particles?: string[];
      visualFx?: import("./types").VisualFxType[];
      haptic?: string;
    } | undefined;

    if (!bundle && typeof input === "string") {
      this.playSound(input);
      return;
    }

    if (bundle?.state) this.transition(bundle.state);

    if (bundle?.motion) motionManager.fireState(bundle.state ?? experienceStateMachine.getState() ?? "Idle", bundle.motion);
    else if (bundle?.state) motionManager.fireState(bundle.state);

    bundle?.sounds?.forEach((cue) => this.playSound(cue));
    bundle?.particles?.forEach((p) => particleManager.emit(p));
    if (bundle?.visualFx) visualEffectManager.triggerGroup(bundle.visualFx);
    if (bundle?.haptic) hapticManager.trigger(bundle.haptic);

    if (!bundle && typeof input === "string") {
      console.warn(`[InteractionController] Unknown effect: ${effectId}`);
    }
  }

  playSound(cueId: string, volume?: number, rate?: number): void {
    this.initialize();
    audioManager.play(cueId, volume, rate);
  }

  setPlaybackRate(cueId: string, rate: number): void {
    audioManager.setPlaybackRate(cueId, rate);
  }

  stopSound(cueId: string, fadeMs?: number): void {
    audioManager.stop(cueId, fadeMs);
  }

  transition(state: MotionState, force = false): void {
    this.initialize();
    if (experienceStateMachine.transition(state, force)) {
      motionManager.fireState(state);
    }
  }

  setScreen(screen: ScreenId): void {
    this.initialize();
    gameStateController.setScreen(screen);
    appEvents.emit({ type: "SCREEN_ENTER", timestamp: Date.now(), payload: { screen }, source: "system" });
  }

  setPhase(phase: number): void {
    gameStateController.setPhase(phase);
  }

  transitionScreen(
    outgoing: Element | null,
    incoming: Element | null,
    type?: TransitionType,
    onComplete?: () => void
  ): void {
    screenTransitionManager.transition(outgoing, incoming, type, onComplete);
  }

  setMasterVolume(v: number): void {
    audioManager.setMasterVolume(v);
  }

  setMute(mute: boolean): void {
    audioManager.setMute(mute);
    hapticManager.setEnabled(!mute);
  }

  applyQuality(tier: "ultra" | "high" | "medium" | "low" | "minimal"): void {
    audioManager.applyQualityTier(tier);
    motionManager.applyQualityTier(tier);
    particleManager.applyQualityTier(tier);
  }

  startArenaAmbience(): void {
    this.initialize();
    this.transition("Idle", true);
  }

  triggerExperience(experienceId: string): void {
    if (EFFECT_REGISTRY[experienceId]) {
      this.playEffect(experienceId);
      return;
    }
    const outcomeState = OUTCOME_TO_STATE[experienceId];
    if (outcomeState) this.playEffect({ id: experienceId, state: outcomeState });
  }

  mountVisualFx(el: HTMLElement): void {
    visualEffectManager.mount(el);
  }

  unmountVisualFx(): void {
    visualEffectManager.unmount();
  }

  private wireGameplayEvents(): void {
    const on = (type: Parameters<typeof gameplayEvents.on>[0], handler: Parameters<typeof gameplayEvents.on>[1]) => {
      this.unsubscribers.push(gameplayEvents.on(type, handler));
    };

    on("SPIN_REQUESTED", () => this.playEffect("spin_request"));
    on("SPIN_ACCELERATION", () => this.playEffect("spin_acceleration"));
    on("SPIN_DECELERATION", () => this.playEffect("spin_brake"));
    on("SPIN_POINTER_LOCK", () => this.playEffect("spin_lock"));
    on("REVEAL_STARTED", () => this.playEffect("reveal_start"));
    on("TOKEN_COLLECTED", () => this.playEffect("token_collected"));
    on("TOKEN_COLLECTION_COMPLETED", () => this.playEffect("tokens_complete"));
    on("STEAL_ACTIVATED", () => this.playEffect("steal_executed"));
    on("EFFECT_TRIGGERED", () => this.playEffect("shield_triggered"));
    on("EFFECT_APPLIED", (event) => {
      const t = (event.payload as { type?: string })?.type;
      if (t === "shield") this.playEffect("guardian");
      else if (t === "cloak") this.playEffect("cloak");
      else if (t === "insurance") this.playEffect("insurance");
      else this.playEffect("shield_triggered");
    });
    on("REVIVE_TRIGGERED", () => this.playEffect("revive_start"));
    on("REVIVE_COMPLETED", () => this.playEffect("revive_complete"));
    // Outcome FX are timed via RevealSequence / handleCardShow — not on early OUTCOME_RECEIVED
    on("PHASE_STARTED", (event) => {
      const phase = (event.payload as { phase?: number })?.phase;
      if (phase && phase > 1) this.playSound("phase_end");
      if (phase) this.setPhase(phase);
    });
  }

  private wireAppEvents(): void {
    this.unsubscribers.push(
      appEvents.on("BUTTON_PRESS", () => this.playEffect("ui_button_press")),
      appEvents.on("COUNTDOWN_TICK", () => this.playEffect("countdown_tick")),
      appEvents.on("COUNTDOWN_GO", () => this.playEffect("countdown_go")),
      appEvents.on("PURCHASE_COMPLETE", () => this.playEffect("purchase_complete")),
      appEvents.on("VICTORY", () => this.playEffect("victory")),
      appEvents.on("SCREEN_ENTER", (e) => {
        const screen = (e.payload as { screen?: ScreenId })?.screen;
        if (screen) gameStateController.setScreen(screen);
      })
    );
  }
}

export const interactionController = new InteractionControllerClass();

export const playEffect = (input: PlayEffectInput) => interactionController.playEffect(input);
export const playSound = (cueId: string, volume?: number) => interactionController.playSound(cueId, volume);
