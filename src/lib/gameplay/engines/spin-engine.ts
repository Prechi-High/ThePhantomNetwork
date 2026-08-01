/**
 * Spin Engine
 * 
 * Owns the entire spin lifecycle:
 * - Wheel physics
 * - Reveal timing
 * - Outcome processing
 * - Token collection coordination
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import { gameplayRuntime } from '../runtime';
import type { EngineInterface } from '../runtime';
import type { SpinOutcome } from '@/types/gameplay';
import { gameplayNetwork } from '@/lib/network';
import { reportClientError } from '@/lib/monitoring/client-report';

export interface SpinConfig {
  spinDuration: number;
  revealDuration: number;
  tokenFlyDuration: number;
}

const DEFAULT_CONFIG: SpinConfig = {
  spinDuration: 6000,
  revealDuration: 3000,
  tokenFlyDuration: 1000,
};

export class SpinEngine implements EngineInterface {
  private config: SpinConfig;
  private pendingOutcome: SpinOutcome | null = null;
  private tokenDelta: number = 0;
  private newTokenTotal: number = 0;

  constructor(config: Partial<SpinConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupListeners();
  }

  private setupListeners(): void {
    gameplayEvents.on('SPIN_REQUESTED', (event) => {
      const payload = event.payload as { subSessionId?: string };
      this.startSpinSequence();
      if (payload.subSessionId) {
        this.requestServerSpin(payload.subSessionId);
      }
    });

    // Handle outcome from server
    gameplayEvents.on('OUTCOME_RECEIVED', (event) => {
      const payload = event.payload as {
        outcome: SpinOutcome;
        tokenDelta: number;
        newTokenTotal: number;
      };
      this.handleOutcome(payload.outcome, payload.tokenDelta, payload.newTokenTotal);
    });
  }

  handleEvent(event: GameplayEvent): void {
    switch (event.type) {
      case 'STATE_TRANSITION':
        this.handleStateTransition(event);
        break;
    }
  }

  private handleStateTransition(event: GameplayEvent): void {
    const { toState } = event.payload as { toState: string };

    switch (toState) {
      case 'SPIN_ACCELERATION':
        gameplayEvents.emit({
          type: 'SPIN_ACCELERATION',
          timestamp: Date.now(),
          source: 'runtime',
        });
        this.scheduleMaxSpeed();
        break;

      case 'SPIN_DECELERATION':
        gameplayEvents.emit({
          type: 'SPIN_DECELERATION',
          timestamp: Date.now(),
          source: 'runtime',
        });
        this.schedulePointerLock();
        break;

      case 'POINTER_LOCK':
        gameplayEvents.emit({
          type: 'SPIN_POINTER_LOCK',
          timestamp: Date.now(),
          source: 'runtime',
        });
        this.scheduleReveal();
        break;

      case 'OUTCOME_REVEAL':
        this.processOutcome();
        break;
    }
  }

  // ============================================================================
  // SPIN SEQUENCE
  // ============================================================================

  private startSpinSequence(): void {
    gameplayEvents.emit({
      type: 'SPIN_STARTED',
      timestamp: Date.now(),
      source: 'runtime',
    });
  }

  private requestServerSpin(subSessionId: string): void {
    gameplayNetwork.requestSpinBackground(subSessionId, {
      onSuccess: (data) => {
        if (data.outcome && data.error === undefined) {
          gameplayRuntime.receiveOutcome(
            data.outcome as SpinOutcome,
            data.tokenDelta ?? 0,
            data.tokens
          );
        } else {
          gameplayEvents.emit({
            type: 'SPIN_VALIDATION_FAILED',
            timestamp: Date.now(),
            source: 'server',
            payload: { reason: data.error ?? 'Spin rejected' },
          });
        }
      },
      onError: (error) => {
        reportClientError({
          area: 'gameplay',
          severity: 'high',
          message: 'Spin request failed',
          cause: error.message,
          context: { subSessionId },
        });
        gameplayEvents.emit({
          type: 'SPIN_VALIDATION_FAILED',
          timestamp: Date.now(),
          source: 'server',
          payload: { reason: error.message },
        });
      },
    });
  }

  private scheduleMaxSpeed(): void {
    setTimeout(() => {
      gameplayEvents.emit({
        type: 'SPIN_MAX_SPEED',
        timestamp: Date.now(),
        source: 'runtime',
      });
    }, this.config.spinDuration - 2000);
  }

  private schedulePointerLock(): void {
    setTimeout(() => {
      gameplayEvents.emit({
        type: 'SPIN_POINTER_LOCK',
        timestamp: Date.now(),
        source: 'runtime',
      });
    }, this.config.spinDuration - 500);
  }

  private scheduleReveal(): void {
    setTimeout(() => {
      gameplayEvents.emit({
        type: 'REVEAL_STARTED',
        timestamp: Date.now(),
        source: 'runtime',
      });
    }, 500);
  }

  // ============================================================================
  // OUTCOME HANDLING
  // ============================================================================

  private handleOutcome(outcome: SpinOutcome, tokenDelta: number, newTotal: number): void {
    this.pendingOutcome = outcome;
    this.tokenDelta = tokenDelta;
    this.newTokenTotal = newTotal;

    console.log('[SpinEngine] Outcome received:', outcome, 'Token delta:', tokenDelta);
  }

  private processOutcome(): void {
    if (!this.pendingOutcome) {
      console.warn('[SpinEngine] No pending outcome to process');
      return;
    }

    const outcome = this.pendingOutcome;

    // Determine next steps based on outcome
    if (outcome === 'STEAL') {
      // Emit steal activation event
      gameplayEvents.emit({
        type: 'STEAL_ACTIVATED',
        timestamp: Date.now(),
        source: 'runtime',
        payload: { targets: [] }, // Will be populated by server
      });
    } else if (this.tokenDelta > 0) {
      // Start token collection
      this.startTokenCollection();
    } else {
      // VOID - no tokens, just complete
      gameplayEvents.emit({
        type: 'READY_FOR_NEXT_SPIN',
        timestamp: Date.now(),
        source: 'runtime',
      });
    }

    // Clear pending
    this.pendingOutcome = null;
  }

  // ============================================================================
  // TOKEN COLLECTION
  // ============================================================================

  private startTokenCollection(): void {
    gameplayEvents.emit({
      type: 'TOKEN_COLLECTION_STARTED',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        totalAmount: this.tokenDelta,
      },
    });

    // Emit individual token arrivals based on amount
    const tokenCount = Math.ceil(this.tokenDelta);
    let collected = 0;

    const emitToken = () => {
      if (collected >= tokenCount) {
        gameplayEvents.emit({
          type: 'TOKEN_COLLECTION_COMPLETED',
          timestamp: Date.now(),
          source: 'runtime',
          payload: {
            totalCollected: this.tokenDelta,
          },
        });
        return;
      }

      const increment = this.tokenDelta === 0.5 ? 0.5 : 1;
      collected++;

      gameplayEvents.emit({
        type: 'TOKEN_COLLECTED',
        timestamp: Date.now(),
        source: 'runtime',
        payload: {
          amount: increment,
          runningTotal: collected * increment,
          animationId: `token-${collected}`,
        },
      });

      // Schedule next token
      setTimeout(emitToken, this.config.tokenFlyDuration / tokenCount);
    };

    // Start token emission after reveal
    setTimeout(emitToken, 500);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  reset(): void {
    this.pendingOutcome = null;
    this.tokenDelta = 0;
    this.newTokenTotal = 0;
  }

  getConfig(): SpinConfig {
    return { ...this.config };
  }
}

export const spinEngine = new SpinEngine();
