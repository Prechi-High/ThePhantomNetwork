export type UserRole = "player" | "camp_owner" | "admin";
export type SessionStatus = "draft" | "open" | "locked" | "active" | "completed" | "invalid";
export type SpinOutcome = "ADVANCE" | "ACQUIRE" | "DISCOVER" | "STEAL" | "VOID";

export type EliminationRuleType = "target" | "percentage" | "none";

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
  config: TargetEliminationConfig | PercentageEliminationConfig | Record<string, never>;
}

export type PhaseConfig = PhaseEntry[];

// For backward compatibility - still support old format for existing code
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

export interface EconomyConfig {
  winner_pct: number;
  refund_ranks: number[];
  performance_ranks: number[];
  performance_pool_pct: number;
  winner_squad_pool_pct: number;
}

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

export interface SubSessionState {
  subSessionId: string;
  phase: number;
  round: number;
  phaseStartedAt: number;
  players: Record<string, PlayerState>;
}

export interface StealTarget {
  userId: string;
  username: string;
  tokens: number;
  reason: string;
}

export interface SpinResult {
  outcome: SpinOutcome;
  tokenDelta: number;
  animationSeed: number;
}

export interface PayoutBreakdown {
  winnerAllocation?: number;
  performance?: number;
  refund?: number;
  squadShare?: number;
  total: number;
}

export const AVATARS = [
  { id: "phantom_1", label: "Shadow", emoji: "🌑" },
  { id: "phantom_2", label: "Specter", emoji: "👻" },
  { id: "phantom_3", label: "Wraith", emoji: "💀" },
  { id: "phantom_4", label: "Viper", emoji: "🐍" },
  { id: "phantom_5", label: "Raven", emoji: "🦅" },
  { id: "phantom_6", label: "Wolf", emoji: "🐺" },
  { id: "phantom_7", label: "Flame", emoji: "🔥" },
  { id: "phantom_8", label: "Crown", emoji: "👑" },
] as const;

export const SPIN_OUTCOME_WEIGHTS: Record<SpinOutcome, number> = {
  ADVANCE: 10,
  ACQUIRE: 25,
  DISCOVER: 30,
  STEAL: 15,
  VOID: 20,
};

/** @deprecated Use SPIN_TIMINGS from spinConfig.ts instead */
export const SPIN_DURATION_MS = 6000;
export const REVIVE_COST = 3;
export const BASE_STEAL_AMOUNT = 1;
export const MAX_FIRE_BOOST_TAPS = 5;
export const SUB_SESSION_MAX_PLAYERS = 100;
export const REGISTRATION_LOCK_MINUTES = 10;
