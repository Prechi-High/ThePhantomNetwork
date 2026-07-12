/**
 * ============================================================================
 * THE PHANTOM NETWORK — SHARED GAMEPLAY LANGUAGE
 * ============================================================================
 *
 * This file is the canonical type definition for all gameplay domain logic.
 * Every store, hook, component, engine, and service must reference these
 * types. Never define local copies of any type found here.
 *
 * Sections:
 *   1. Primitives & Enums
 *   2. Session & Phase
 *   3. Player & Squad
 *   4. Spin & Outcome
 *   5. Combat (Steal / Revive)
 *   6. Effects & Inventory
 *   7. Live World
 *   8. Animation & Audio Tasks
 *   9. Runtime Context
 *  10. Economy & Payouts
 *  11. Constants
 * ============================================================================
 */

// ============================================================================
// 1. PRIMITIVES & ENUMS
// ============================================================================

export type UserRole = 'player' | 'camp_owner' | 'admin';

export type SessionStatus =
  | 'draft'
  | 'open'
  | 'locked'
  | 'active'
  | 'completed'
  | 'invalid';

export type SpinOutcome = 'ADVANCE' | 'ACQUIRE' | 'DISCOVER' | 'STEAL' | 'VOID';

export type EliminationRuleType = 'target' | 'percentage' | 'none';

export type PlayerStatus = 'active' | 'eliminated' | 'revivable' | 'spectating';

export type CombatActionType = 'steal' | 'revive';

export type EffectType = 'shield' | 'cloak' | 'insurance' | 'boost';

export type OutcomeCategory = 'positive' | 'neutral' | 'combat' | 'empty';

// ============================================================================
// 2. SESSION & PHASE
// ============================================================================

export interface TargetEliminationConfig {
  target: number;
  revivable_min: number;
  revivable_max: number;
  eliminated_below: number;
}

export interface PercentageEliminationConfig {
  eliminate_bottom_pct: number;
}

export interface PhaseEntry {
  phase: number;
  duration_minutes: number;
  elimination_rule: EliminationRuleType;
  config:
    | TargetEliminationConfig
    | PercentageEliminationConfig
    | Record<string, never>;
}

export type PhaseConfig = PhaseEntry[];

/** Current phase runtime state, updated by the server via realtime */
export interface PhaseState {
  phase: number;
  round: number;
  maxRoundsPerPhase: number;
  phaseEndsAt: number | null;
  phaseStartedAt: number | null;
  totalPlayers: number;
  alivePlayers: number;
}

/** Full session metadata */
export interface SessionMeta {
  sessionId: string;
  subSessionId: string;
  status: SessionStatus;
  totalPoolCents: number | null;
  phaseConfig: PhaseConfig;
  maxPlayers: number;
  entryFeeCents: number;
}

// ============================================================================
// 3. PLAYER & SQUAD
// ============================================================================

export interface PlayerState {
  userId: string;
  tokens: number;
  isEliminated: boolean;
  isRevivable: boolean;
  shieldCount: number;
  cloakActive: boolean;
  cloakExpiresAt?: number;
  insuranceActive: boolean;
  stealBoostActive: boolean;
  shieldBoostActive: boolean;
}

export interface PlayerStatus_Detail {
  status: PlayerStatus;
  rank: number;
  totalPlayers: number;
}

export interface SubSessionState {
  subSessionId: string;
  phase: number;
  round: number;
  phaseStartedAt: number;
  players: Record<string, PlayerState>;
}

export interface SquadMemberState {
  userId: string;
  username: string;
  tokens: number;
  isEliminated: boolean;
  isRevivable?: boolean;
}

export interface SquadStatus {
  squadId: string;
  name: string;
  totalTokens: number;
  members: SquadMemberState[];
  aliveCount: number;
}

// ============================================================================
// 4. SPIN & OUTCOME
// ============================================================================

/** Raw spin result from the server */
export interface SpinResult {
  outcome: SpinOutcome;
  tokenDelta: number;
  animationSeed: number;
}

/** Enriched result passed through the runtime after receiving server outcome */
export interface ResolvedOutcome {
  outcome: SpinOutcome;
  tokenDelta: number;
  newTokenTotal: number;
  requiresTargetSelection: boolean;
  category: OutcomeCategory;
  serverTimestamp: number;
}

/** Display metadata for an outcome (sourced from spinConfig) */
export interface OutcomeVisual {
  primary: string;
  accent: string;
  glow: string;
  glowStrength: 'soft' | 'medium' | 'strong' | 'very-strong';
  particles: string[];
  cardTitle: string;
  cardSubtitle: string;
  icon: string;
  soundType: 'legendary' | 'reward' | 'magical' | 'sharp' | 'empty';
  cameraShake: 'none' | 'subtle' | 'medium' | 'strong';
}

// ============================================================================
// 5. COMBAT (STEAL / REVIVE)
// ============================================================================

export interface StealTarget {
  userId: string;
  username: string;
  tokens: number;
  reason: string;
}

export interface ReviveTarget {
  userId: string;
  username: string;
  cost: number;
}

export interface CombatAction {
  type: CombatActionType;
  actorId: string;
  targetId: string;
  amount: number;
  resolvedAt: number;
  success: boolean;
}

export interface StealResolution {
  success: boolean;
  amount: number;
  blocked: boolean;
  attackerId: string;
  victimId: string;
}

// ============================================================================
// 6. EFFECTS & INVENTORY
// ============================================================================

export interface EffectState {
  id: string;
  type: EffectType;
  activatedAt: number;
  expiresAt: number;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  type: EffectType | 'cosmetic' | 'consumable';
  quantity: number;
  usedAt?: number;
}

// ============================================================================
// 7. LIVE WORLD
// ============================================================================

export type LiveFeedEventType =
  | 'elimination'
  | 'steal'
  | 'revive'
  | 'phase_change'
  | 'token_milestone'
  | 'squad_activity'
  | 'rival_activity';

export interface LiveFeedEvent {
  id: string;
  type: LiveFeedEventType;
  message: string;
  playerId?: string;
  playerName?: string;
  squadId?: string;
  amount?: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  tokens: number;
  isSquadMember?: boolean;
  isCurrentPlayer?: boolean;
}

export interface RivalActivity {
  userId: string;
  username: string;
  lastAction: string;
  tokens: number;
  isEliminated: boolean;
  updatedAt: number;
}

// ============================================================================
// 8. ANIMATION & AUDIO TASKS
// ============================================================================

export type AnimationTaskType =
  | 'wheel'
  | 'reveal'
  | 'tokens'
  | 'celebration'
  | 'effect'
  | 'ui';

export interface AnimationTask {
  id: string;
  type: AnimationTaskType;
  priority: number;
  duration: number;
  startedAt?: number;
  completedAt?: number;
  data?: Record<string, unknown>;
}

export type AudioCategory = 'music' | 'sfx' | 'ambient' | 'voice';

export interface AudioTask {
  id: string;
  soundId: string;
  category: AudioCategory;
  volume: number;
  loop: boolean;
  scheduledAt?: number;
  playedAt?: number;
}

// ============================================================================
// 9. RUNTIME CONTEXT
// ============================================================================

/**
 * The complete snapshot of gameplay state the runtime maintains.
 * Components read slices of this — they never write to it directly.
 */
export interface RuntimeContext {
  // Identity
  sessionId: string | null;
  subSessionId: string | null;
  playerId: string | null;

  // Phase
  phase: number;
  round: number;
  phaseEndsAt: number | null;

  // Player
  tokens: number;
  isEliminated: boolean;
  isRevivable: boolean;

  // Spin
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  lastResolvedOutcome: ResolvedOutcome | null;
  canSpin: boolean;

  // World
  playerRank: number;
  totalPlayers: number;
  alivePlayers: number;
}

// ============================================================================
// 10. ECONOMY & PAYOUTS
// ============================================================================

export interface EconomyConfig {
  winner_pct: number;
  refund_ranks: number[];
  performance_ranks: number[];
  performance_pool_pct: number;
  winner_squad_pool_pct: number;
}

export interface PayoutBreakdown {
  winnerAllocation?: number;
  performance?: number;
  refund?: number;
  squadShare?: number;
  total: number;
}

// ============================================================================
// 11. CONSTANTS
// ============================================================================

export const AVATARS = [
  { id: 'phantom_1', label: 'Shadow', emoji: '🕶' },
  { id: 'phantom_2', label: 'Specter', emoji: '👻' },
  { id: 'phantom_3', label: 'Wraith', emoji: '🦇' },
  { id: 'phantom_4', label: 'Viper', emoji: '🐍' },
  { id: 'phantom_5', label: 'Raven', emoji: '🪶' },
  { id: 'phantom_6', label: 'Wolf', emoji: '🐺' },
  { id: 'phantom_7', label: 'Flame', emoji: '🔥' },
  { id: 'phantom_8', label: 'Crown', emoji: '👑' },
] as const;

export const SPIN_OUTCOME_WEIGHTS: Record<SpinOutcome, number> = {
  ADVANCE: 10,
  ACQUIRE: 25,
  DISCOVER: 30,
  STEAL: 15,
  VOID: 20,
};

export const OUTCOME_CATEGORIES: Record<SpinOutcome, OutcomeCategory> = {
  ADVANCE: 'positive',
  ACQUIRE: 'positive',
  DISCOVER: 'neutral',
  STEAL: 'combat',
  VOID: 'empty',
};

export const REVIVE_COST = 3;
export const BASE_STEAL_AMOUNT = 1;
export const MAX_FIRE_BOOST_TAPS = 5;
export const SUB_SESSION_MAX_PLAYERS = 100;
export const REGISTRATION_LOCK_MINUTES = 10;

/** @deprecated Use SPIN_TIMINGS from spinConfig.ts instead */
export const SPIN_DURATION_MS = 6000;

// ============================================================================
// LEGACY COMPAT — keep these until all references are updated
// ============================================================================

/** @deprecated Use PhaseEntry instead */
export interface LegacyPhaseConfig {
  phase1: {
    target: number;
    revivable_min: number;
    revivable_max: number;
    eliminated_below: number;
  };
  phase2: { eliminate_bottom_pct: number };
  phase3: { eliminate_bottom_pct: number };
  phase4: { duration_minutes: number };
}
