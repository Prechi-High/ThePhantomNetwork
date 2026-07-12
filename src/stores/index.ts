/**
 * ============================================================================
 * STORES — PUBLIC MODULE BOUNDARY
 * ============================================================================
 *
 * This file is the only official entry point for all gameplay stores.
 * Import stores from here, not from individual store files.
 *
 * Rules:
 *   - Only public interfaces are exported (selectors, types, hooks).
 *   - Internal implementation details stay inside each store file.
 *   - Components subscribe to named selectors — never the full store.
 *   - Stores never import from each other.
 *
 * Domain boundaries:
 *   useGameplayStore  — runtime state (CPU)
 *   useSessionStore   — session intelligence (referee)
 *   useStealStore     — combat state (officer)
 *   useEffectsStore   — active effects (status manager)
 *   useInventoryStore — owned items (backpack)
 *   useLeaderboardStore — rankings (scoreboard)
 *   useLiveFeedStore  — world activity (world memory)
 * ============================================================================
 */

// ── Gameplay Runtime Store ─────────────────────────────────────────────────

export {
  useGameplayStore,
  selectSpinButtonState,
  selectTokens,
  selectPhaseState,
  selectRevealState,
  selectDebugSnapshot,
} from "./useGameplayStore";
export type { SpinRecord, AnimationTask, AudioTask } from "./useGameplayStore";

// ── Session Store ──────────────────────────────────────────────────────────

export {
  useSessionStore,
  selectPhase,
  selectSubSessionId,
  selectPlayerCounts,
  selectPrizePool,
  selectSessionStatus,
  selectServerSync,
} from "./useSessionStore";
export type { PhaseRecord, PlayerCounts } from "./useSessionStore";

// ── Steal / Combat Store ───────────────────────────────────────────────────

export {
  useStealStore,
  selectStealTargets,
  selectStealPicker,
  selectFireBoost,
  selectCombatStatus,
} from "./useStealStore";
export type { EnrichedTarget, StealRecord, RiskLevel } from "./useStealStore";

// ── Effects Store ──────────────────────────────────────────────────────────

export {
  useEffectsStore,
  selectActiveEffects,
  selectEffectFlags,
  selectLastExpiredEffect,
} from "./useEffectsStore";
export type { ActiveEffect, EffectType } from "./useEffectsStore";

// ── Inventory Store ────────────────────────────────────────────────────────

export {
  useInventoryStore,
  selectSkills,
  selectAvailableSkills,
  selectConsumables,
  selectCosmetics,
  selectInventoryLoaded,
} from "./useInventoryStore";
export type { SkillInInventory, Consumable, CosmeticItem } from "./useInventoryStore";

// ── Leaderboard Store ──────────────────────────────────────────────────────

export {
  useLeaderboardStore,
  selectTopPlayers,
  selectTopSquads,
  selectPlayerRank,
  selectRankPercentile,
  selectRankMovements,
  selectLeaderboardStale,
} from "./useLeaderboardStore";
export type {
  LeaderboardEntry,
  SquadLeaderboardEntry,
  RankMovement,
} from "./useLeaderboardStore";

// ── Live Feed Store ────────────────────────────────────────────────────────

export {
  useLiveFeedStore,
  selectFeedEvents,
  selectPinnedEvents,
  selectUnreadCount,
  selectRecentEvents,
} from "./useLiveFeedStore";
export type {
  FeedEvent,
  FeedEventActor,
  FeedEventTarget,
  FeedEventType,
  FeedEventPriority,
} from "./useLiveFeedStore";

// ── World Store ────────────────────────────────────────────────────────────

export {
  useWorldStore,
  selectWorldStats,
  selectWorldHistory,
  selectCampMomentum,
  selectActiveWorldEvent,
  selectReturnSummary,
  selectMyReputation,
  selectActiveRivalries,
  selectIsWorldLoaded,
} from "./useWorldStore";
export type { ReturnSummary, DailyFeature } from "./useWorldStore";
