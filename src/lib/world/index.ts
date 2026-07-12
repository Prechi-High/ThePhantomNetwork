/**
 * World Module — Public API
 * The persistent living world layer.
 */

export { worldTimeline }             from "./worldTimeline";
export { campMomentumEngine }        from "./campMomentum";
export { rivalrySystem }             from "./rivalrySystem";
export { reputationEngine }          from "./reputationEngine";
export { worldEventsManager }        from "./worldEvents";

export type { WorldHistoryEntry, WorldStats, WorldRecord, WorldEventType } from "./worldTimeline";
export type { CampMomentumEntry, MomentumTrend }                           from "./campMomentum";
export type { RivalryRecord, RivalryStatus }                               from "./rivalrySystem";
export type { PlayerReputation, PlayerArchetype, PlayerBehaviorStats }     from "./reputationEngine";
export type { WorldEvent, WorldEventId, WorldEventStatus }                 from "./worldEvents";
