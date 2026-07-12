/**
 * Gameplay Event System
 * All gameplay actions flow through these typed events
 * Nothing bypasses the runtime - components consume events, they don't create gameplay logic
 */

// ============================================================================
// CORE GAMEPLAY EVENT TYPES
// ============================================================================

export type GameplayEventType =
  // Session Lifecycle
  | 'SESSION_LOADING'
  | 'SESSION_LOADED'
  | 'SESSION_ERROR'
  
  // Phase Management
  | 'PHASE_STARTED'
  | 'PHASE_ENDING'
  | 'PHASE_COMPLETED'
  | 'WAITING_FOR_PHASE'
  
  // Network Intro
  | 'NETWORK_INTRO_STARTED'
  | 'NETWORK_INTRO_COMPLETED'
  
  // Spin Lifecycle
  | 'SPIN_REQUESTED'
  | 'SPIN_VALIDATION_FAILED'
  | 'SPIN_STARTED'
  | 'SPIN_ACCELERATION'
  | 'SPIN_MAX_SPEED'
  | 'SPIN_DECELERATION'
  | 'SPIN_POINTER_LOCK'
  
  // Outcome & Reveal
  | 'OUTCOME_RECEIVED'
  | 'REVEAL_STARTED'
  | 'REVEAL_BUILDUP'
  | 'REVEAL_COMPLETED'
  | 'OUTCOME_REVEAL'
  
  // Token Collection
  | 'TOKEN_COLLECTION_STARTED'
  | 'TOKEN_COLLECTED'
  | 'TOKEN_COLLECTION_COMPLETED'
  
  // Combat (Steal/Revive)
  | 'STEAL_ACTIVATED'
  | 'STEAL_TARGET_SELECTED'
  | 'STEAL_EXECUTED'
  | 'STEAL_RESOLVED'
  | 'REVIVE_AVAILABLE'
  | 'REVIVE_TRIGGERED'
  | 'REVIVE_COMPLETED'
  
  // Effects
  | 'EFFECT_APPLIED'
  | 'EFFECT_EXPIRED'
  | 'EFFECT_TRIGGERED'
  
  // World Updates
  | 'HUD_REFRESH'
  | 'LIVE_FEED_UPDATE'
  | 'LEADERBOARD_UPDATE'
  | 'SQUAD_UPDATE'
  | 'RIVALS_UPDATE'
  | 'LIVE_WORLD_REFRESH'
  
  // State Transitions
  | 'STATE_TRANSITION'
  | 'READY_FOR_NEXT_SPIN'
  | 'GAMEPLAY_PAUSED'
  | 'GAMEPLAY_RESUMED'
  | 'SESSION_COMPLETED';

// ============================================================================
// EVENT PAYLOADS
// ============================================================================

export interface GameplayEvent {
  type: GameplayEventType;
  timestamp: number;
  payload?: unknown;
  source: 'player' | 'server' | 'runtime' | 'system';
}

export interface SpinRequestedPayload {
  subSessionId: string;
  playerId: string;
}

export interface OutcomeReceivedPayload {
  outcome: 'ADVANCE' | 'ACQUIRE' | 'DISCOVER' | 'STEAL' | 'VOID';
  tokenDelta: number;
  newTokenTotal: number;
  requiresTargetSelection: boolean;
  serverTimestamp: number;
}

export interface PhaseStartedPayload {
  phase: number;
  round: number;
  phaseEndsAt: number;
  totalPlayers: number;
}

export interface TokenCollectedPayload {
  amount: number;
  runningTotal: number;
  animationId: string;
}

export interface StealActivatedPayload {
  targets: Array<{
    userId: string;
    username: string;
    tokens: number;
  }>;
}

export interface LiveFeedUpdatePayload {
  events: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
  }>;
}

export interface LeaderboardUpdatePayload {
  rankings: Array<{
    rank: number;
    userId: string;
    username: string;
    tokens: number;
  }>;
  playerRank: number;
}

export interface EffectAppliedPayload {
  effectId: string;
  type: 'shield' | 'cloak' | 'insurance' | 'boost';
  expiresAt: number;
}

export interface StateTransitionPayload {
  fromState: GameplayState;
  toState: GameplayState;
  reason: string;
}

// ============================================================================
// GAMEPLAY STATE
// ============================================================================

export type GameplayState =
  | 'SESSION_LOADING'
  | 'NETWORK_INTRO'
  | 'WAITING_FOR_PHASE'
  | 'READY'
  | 'BUTTON_PRESS'
  | 'CHARGE'
  | 'SPIN_ACCELERATION'
  | 'SPIN_HIGH_SPEED'
  | 'SPIN_DECELERATION'
  | 'POINTER_LOCK'
  | 'SUSPENSE'
  | 'REVEAL_BUILDUP'
  | 'OUTCOME_REVEAL'
  | 'WORLD_REACTION'
  | 'TOKEN_COLLECTION'
  | 'HUD_SYNCHRONIZATION'
  | 'LIVE_WORLD_REFRESH'
  | 'STEAL_SELECTION'
  | 'REVIVE_PENDING'
  | 'READY_FOR_NEXT_SPIN'
  | 'SESSION_COMPLETED';

// ============================================================================
// EVENT EMITTER
// ============================================================================

type EventListener = (event: GameplayEvent) => void;

class GameplayEventEmitter {
  private listeners: Map<GameplayEventType, Set<EventListener>> = new Map();
  private allListeners: Set<EventListener> = new Set();

  emit(event: GameplayEvent): void {
    // Notify specific listeners
    this.listeners.get(event.type)?.forEach(listener => listener(event));
    
    // Notify global listeners
    this.allListeners.forEach(listener => listener(event));
    
    console.log(`[GameplayEvent] ${event.type}`, event.payload || '');
  }

  on(eventType: GameplayEventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
    
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  onAll(listener: EventListener): () => void {
    this.allListeners.add(listener);
    return () => {
      this.allListeners.delete(listener);
    };
  }

  clear(): void {
    this.listeners.clear();
    this.allListeners.clear();
  }
}

export const gameplayEvents = new GameplayEventEmitter();
