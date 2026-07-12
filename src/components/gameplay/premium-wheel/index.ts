/**
 * ============================================================================
 * PREMIUM WHEEL MODULE — PUBLIC API
 * ============================================================================
 *
 * Exposes only the stable public surface of the wheel subsystem.
 * Internal animation engines, state machines, and audio controllers
 * are implementation details — not re-exported here.
 *
 * Primary consumer API:
 *   <PremiumSpinWheel /> — full cinematic wheel with all subsystems
 *   <ButtonAnimator />   — standalone engage button
 *
 * Secondary API (for custom embedding):
 *   <SpinAnimator />     — wheel visual only, no orchestration
 *   <OutcomeCard />      — outcome reveal card
 *   spinAudio            — audio controller singleton
 *
 * Configuration (for tuning without touching components):
 *   getTargetAngle()     — used by the server API route
 *   getSectorIndex()     — wheel geometry helper
 * ============================================================================
 */

// ── Primary components ─────────────────────────────────────────────────────

export { PremiumSpinWheel, SpinWheel } from "./PremiumSpinWheel";
export { ButtonAnimator }              from "./ButtonAnimator";

// ── Secondary / composition components ────────────────────────────────────

export { SpinAnimator }             from "./SpinAnimator";
export { RevealSequence }           from "./RevealSequence";
export { OutcomeCard }              from "./OutcomeCard";
export { TokenCollectionAnimator }  from "./TokenCollectionAnimator";
export { ParticleController }       from "./ParticleController";
export { OutcomeCelebration }       from "./OutcomeCelebration";

// ── Audio controller (singleton) ──────────────────────────────────────────

export { spinAudio } from "./SpinAudioController";

// ── Geometry helpers (used by API route + tests) ──────────────────────────

export { getTargetAngle, getTargetRotation, getSectorIndex, WHEEL_SECTORS } from "./config";

// ── Optional: FairnessPanel (provably fair disclosure) ────────────────────

export { FairnessPanel } from "./FairnessPanel";
