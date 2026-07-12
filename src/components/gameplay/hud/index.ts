/**
 * ============================================================================
 * HUD MODULE — PUBLIC API
 * ============================================================================
 *
 * Only stable public interfaces are exported here.
 * Internal widget implementation details are not exposed.
 *
 * The single component consumers need is GameplayHUD.
 * All other exports support advanced composition only.
 * ============================================================================
 */

// ── Primary HUD orchestrator (the only import most consumers need) ─────────

export { GameplayHUD } from "./GameplayHUD";
export type { HudPhaseMode } from "./GameplayHUD";

// ── Individual widgets (for advanced embedding / HUD Studio) ───────────────

export { TopHUD }              from "./TopHUD";
export { ShadowSurge }         from "./ShadowSurge";
export { WheelHUD }            from "./WheelHUD";
export { LiveFeed }            from "./LiveFeed";
export { SquadPanel }          from "./SquadPanel";
export { ActiveEffects }       from "./ActiveEffects";
export { SkillDockHUD }        from "./SkillDockHUD";
export { SpinButton }          from "./SpinButton";
export { VoiceWidgetHUD }      from "./VoiceWidget";
export { RecordingWidgetHUD }  from "./RecordingWidget";

// ── Design tokens (for HUD Studio theming) ────────────────────────────────
// Internal CSS is in responsive.css — not re-exported
