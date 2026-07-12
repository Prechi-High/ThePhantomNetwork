/**
 * Experience Module — Public API
 *
 * Primary consumer: useExperienceEngine (React hook)
 * Advanced consumers: individual engines for testing
 */

// Primary singleton (the only import most consumers need)
export { experienceEngine, ExperienceEngineClass } from "./ExperienceEngine";

// React bridge
// (imported from hooks/useExperienceEngine — not re-exported here to avoid client bundle issues)

// Individual systems (for testing / advanced use)
export { experienceTimeline }    from "./timeline";
export { cameraSystem }          from "./cameraSystem";
export { lightingEngine }        from "./lightingEngine";
export { particleOrchestrator }  from "./particleOrchestrator";
export { audioLayerController }  from "./audioLayer";
export { screenFX }              from "./screenFX";
export { haptics, GAMEPLAY_HAPTICS } from "./haptics";
export { qualityManager }        from "./qualityManager";
export { getMotionPreset, MOTION_PRESETS, EASING } from "./motionLanguage";

// Types
export type { TimelinePriority, TimelineTask, TimelineTaskStatus } from "./timeline";
export type { CameraReaction }      from "./cameraSystem";
export type { LightingState }       from "./lightingEngine";
export type { ParticleType, ParticleConfig } from "./particleOrchestrator";
export type { AudioLayer, MusicIntensity }  from "./audioLayer";
export type { ScreenFXType }        from "./screenFX";
export type { HapticPattern }       from "./haptics";
export type { QualityTier, QualityProfile } from "./qualityManager";
export type { MotionCategory, GameplayEventMotion, MotionPreset } from "./motionLanguage";
