/**
 * Gameplay Runtime - Single Source of Truth
 * 
 * The heart of the gameplay system. All gameplay actions flow through this orchestrator.
 * Nothing bypasses the runtime - components consume events, they don't drive gameplay.
 * 
 * Architecture:
 * Player Action → Runtime → Server → Runtime → Animation → Audio → Stores → HUD
 */

import { gameplayEvents, type GameplayState, type GameplayEvent } from './events';
import type { SpinOutcome } from '@/types/gameplay';

// ============================================================================
// RUNTIME STATE
// ============================================================================

interface RuntimeState {
  currentState: GameplayState;
  previousState: GameplayState | null;
  
  // Session data
  sessionId: string | null;
  subSessionId: string | null;
  phase: number;
  round: number;
  phaseEndsAt: number | null;
  
  // Player data
  tokens: number;
  isEliminated: boolean;
  isRevivable: boolean;
  
  // Spin state
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  canSpin: boolean;
  
  // Timing
  lastSpinTimestamp: number | null;
  cooldownRemaining: number;
  
  // Error state
  lastError: string | null;
}

// ============================================================================
// GAMEPLAY RUNTIME CLASS
// ============================================================================

class GameplayRuntime {
  private state: RuntimeState;
  private eventHistory: GameplayEvent[] = [];
  private maxHistorySize: number = 100;
  
  // Engine references (to be set during initialization)
  private engines: Map<string, EngineInterface> = new Map();

  constructor() {
    this.state = this.getInitialState();
    this.setupInternalListeners();
  }

  private getInitialState(): RuntimeState {
    return {
      currentState: 'SESSION_LOADING',
      previousState: null,
      sessionId: null,
      subSessionId: null,
      phase: 1,
      round: 1,
      phaseEndsAt: null,
      tokens: 0,
      isEliminated: false,
      isRevivable: false,
      isSpinning: false,
      spinLocked: false,
      lastOutcome: null,
      canSpin: false,
      lastSpinTimestamp: null,
      cooldownRemaining: 0,
      lastError: null,
    };
  }

  // ============================================================================
  // STATE MACHINE
  // ============================================================================

  transitionTo(newState: GameplayState, reason?: string): boolean {
    const validTransitions = this.getValidTransitions(this.state.currentState);
    
    if (!validTransitions.includes(newState)) {
      console.warn(
        `[GameplayRuntime] Invalid transition: ${this.state.currentState} → ${newState}`
      );
      return false;
    }

    const previousState = this.state.currentState;
    this.state.previousState = previousState;
    this.state.currentState = newState;

    gameplayEvents.emit({
      type: 'STATE_TRANSITION',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        fromState: previousState,
        toState: newState,
        reason: reason || 'Runtime transition',
      },
    });

    this.onStateEnter(newState);
    return true;
  }

  private getValidTransitions(current: GameplayState): GameplayState[] {
    const transitions: Record<GameplayState, GameplayState[]> = {
      'SESSION_LOADING': ['NETWORK_INTRO', 'READY', 'SESSION_COMPLETED'],
      'NETWORK_INTRO': ['WAITING_FOR_PHASE', 'READY'],
      'WAITING_FOR_PHASE': ['READY', 'SESSION_COMPLETED'],
      'READY': ['BUTTON_PRESS', 'SESSION_COMPLETED', 'WAITING_FOR_PHASE'],
      'BUTTON_PRESS': ['CHARGE', 'SPIN_ACCELERATION', 'READY'],
      'CHARGE': ['SPIN_ACCELERATION', 'READY'],
      'SPIN_ACCELERATION': ['SPIN_HIGH_SPEED'],
      'SPIN_HIGH_SPEED': ['SPIN_DECELERATION'],
      'SPIN_DECELERATION': ['POINTER_LOCK'],
      'POINTER_LOCK': ['SUSPENSE'],
      'SUSPENSE': ['REVEAL_BUILDUP'],
      'REVEAL_BUILDUP': ['OUTCOME_REVEAL'],
      'OUTCOME_REVEAL': ['WORLD_REACTION', 'TOKEN_COLLECTION', 'STEAL_SELECTION', 'READY_FOR_NEXT_SPIN'],
      'WORLD_REACTION': ['TOKEN_COLLECTION', 'READY_FOR_NEXT_SPIN'],
      'TOKEN_COLLECTION': ['HUD_SYNCHRONIZATION', 'READY_FOR_NEXT_SPIN'],
      'HUD_SYNCHRONIZATION': ['LIVE_WORLD_REFRESH', 'READY_FOR_NEXT_SPIN'],
      'LIVE_WORLD_REFRESH': ['READY_FOR_NEXT_SPIN'],
      'STEAL_SELECTION': ['READY_FOR_NEXT_SPIN', 'OUTCOME_REVEAL'],
      'REVIVE_PENDING': ['READY', 'OUTCOME_REVEAL'],
      'READY_FOR_NEXT_SPIN': ['READY', 'WAITING_FOR_PHASE', 'SESSION_COMPLETED'],
      'SESSION_COMPLETED': [],
    };

    return transitions[current] || [];
  }

  private onStateEnter(state: GameplayState): void {
    switch (state) {
      case 'READY':
        this.state.canSpin = true;
        this.state.spinLocked = false;
        break;
        
      case 'BUTTON_PRESS':
      case 'SPIN_ACCELERATION':
      case 'SPIN_HIGH_SPEED':
      case 'SPIN_DECELERATION':
        this.state.isSpinning = true;
        this.state.spinLocked = true;
        break;
        
      case 'READY_FOR_NEXT_SPIN':
        this.state.isSpinning = false;
        this.state.canSpin = false; // Will be enabled after cooldown
        setTimeout(() => this.transitionTo('READY', 'Cooldown complete'), 500);
        break;
        
      case 'SESSION_COMPLETED':
        this.state.canSpin = false;
        break;
    }
  }

  // ============================================================================
  // PUBLIC API - ACTIONS
  // ============================================================================

  /**
   * Initialize the runtime with session data
   */
  initialize(sessionId: string, subSessionId: string): void {
    this.state.sessionId = sessionId;
    this.state.subSessionId = subSessionId;
    
    gameplayEvents.emit({
      type: 'SESSION_LOADING',
      timestamp: Date.now(),
      source: 'system',
      payload: { sessionId, subSessionId },
    });
  }

  /**
   * Request a spin - goes through validation and server communication
   */
  async requestSpin(): Promise<boolean> {
    if (!this.canSpinNow()) {
      console.warn('[GameplayRuntime] Cannot spin now:', this.getSpinBlockReason());
      gameplayEvents.emit({
        type: 'SPIN_VALIDATION_FAILED',
        timestamp: Date.now(),
        source: 'runtime',
        payload: { reason: this.getSpinBlockReason() },
      });
      return false;
    }

    this.transitionTo('BUTTON_PRESS', 'Player requested spin');
    
    gameplayEvents.emit({
      type: 'SPIN_REQUESTED',
      timestamp: Date.now(),
      source: 'player',
      payload: { subSessionId: this.state.subSessionId },
    });

    return true;
  }

  /**
   * Server has provided an outcome - begin reveal sequence
   */
  receiveOutcome(outcome: SpinOutcome, tokenDelta: number, newTotal: number): void {
    this.state.lastOutcome = outcome;
    this.state.lastSpinTimestamp = Date.now();
    
    gameplayEvents.emit({
      type: 'OUTCOME_RECEIVED',
      timestamp: Date.now(),
      source: 'server',
      payload: {
        outcome,
        tokenDelta,
        newTokenTotal: newTotal,
        requiresTargetSelection: outcome === 'STEAL',
        serverTimestamp: Date.now(),
      },
    });
  }

  /**
   * Phase has changed
   */
  updatePhase(phase: number, round: number, phaseEndsAt: number | null): void {
    const previousPhase = this.state.phase;
    this.state.phase = phase;
    this.state.round = round;
    this.state.phaseEndsAt = phaseEndsAt;

    if (phase !== previousPhase) {
      gameplayEvents.emit({
        type: 'PHASE_STARTED',
        timestamp: Date.now(),
        source: 'server',
        payload: {
          phase,
          round,
          phaseEndsAt: phaseEndsAt || 0,
          totalPlayers: 0,
        },
      });
    }
  }

  /**
   * Update player tokens
   */
  updateTokens(tokens: number): void {
    this.state.tokens = tokens;
  }

  /**
   * Complete the session
   */
  completeSession(): void {
    this.transitionTo('SESSION_COMPLETED', 'Session ended');
    
    gameplayEvents.emit({
      type: 'SESSION_COMPLETED',
      timestamp: Date.now(),
      source: 'server',
    });
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  canSpinNow(): boolean {
    return (
      this.state.currentState === 'READY' &&
      !this.state.isSpinning &&
      !this.state.spinLocked &&
      !this.state.isEliminated &&
      this.state.subSessionId !== null
    );
  }

  getSpinBlockReason(): string {
    if (this.state.isEliminated) return 'Player is eliminated';
    if (this.state.isSpinning) return 'Currently spinning';
    if (this.state.spinLocked) return 'Spin is locked';
    if (!this.state.subSessionId) return 'No active session';
    if (this.state.currentState !== 'READY') return `Not ready (current state: ${this.state.currentState})`;
    return 'Unknown';
  }

  getCurrentState(): GameplayState {
    return this.state.currentState;
  }

  getState(): Readonly<RuntimeState> {
    return { ...this.state };
  }

  // ============================================================================
  // ENGINE REGISTRATION
  // ============================================================================

  registerEngine(name: string, engine: EngineInterface): void {
    this.engines.set(name, engine);
    console.log(`[GameplayRuntime] Registered engine: ${name}`);
  }

  getEngine<T extends EngineInterface>(name: string): T | undefined {
    return this.engines.get(name) as T | undefined;
  }

  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================

  private setupInternalListeners(): void {
    // Log all events in development
    gameplayEvents.onAll((event) => {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    });
  }

  getEventHistory(): GameplayEvent[] {
    return [...this.eventHistory];
  }

  reset(): void {
    this.state = this.getInitialState();
    this.eventHistory = [];
    console.log('[GameplayRuntime] Reset to initial state');
  }
}

// ============================================================================
// ENGINE INTERFACE
// ============================================================================

interface EngineInterface {
  handleEvent?(event: GameplayEvent): void;
  reset?(): void;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const gameplayRuntime = new GameplayRuntime();
export type { EngineInterface };
