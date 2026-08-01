/**
 * Network layer — shared types and errors.
 */

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NetworkError };

export interface SpinResponse {
  outcome: string;
  tokens: number;
  tokenDelta: number;
  requiresTargetSelection?: boolean;
  spinId?: string;
  hashedServerSeed?: string;
  clientSeed?: string;
  nonce?: number;
  randomFloat?: number;
  winningIndex?: number;
  targetAngle?: number;
  error?: string;
}

export interface GameplayStateResponse {
  player?: {
    user_id: string;
    session_tokens: number;
    is_eliminated: boolean;
    is_revivable: boolean;
  };
  phase?: number;
  phaseEndsAt?: number | null;
  round?: number;
  maxRoundsPerPhase?: number;
  playerRank?: number;
  totalPlayers?: number;
  squadMembers?: Array<{
    user_id: string;
    session_tokens: number;
    is_eliminated: boolean;
    is_revivable?: boolean;
    profiles?: { username: string } | null;
  }>;
  leaderboard?: Array<{
    user_id: string;
    session_tokens: number;
    profiles?: { username: string } | null;
  }>;
  sessionStatus?: string;
  subSessionStatus?: string;
  subSession?: { status?: string };
  error?: string;
}

export interface StealTargetsResponse {
  targets?: Array<{
    user_id: string;
    username: string;
    tokens: number;
    risk?: "low" | "medium" | "high";
    isRival?: boolean;
    streak?: number;
  }>;
  error?: string;
}

export interface StealExecuteResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface ReviveResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface TacticalActivateResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface PhaseAdvanceResponse {
  success?: boolean;
  phase?: number;
  error?: string;
}
