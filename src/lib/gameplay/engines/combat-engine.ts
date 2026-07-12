/**
 * Combat Engine
 * 
 * Owns all steal and revive mechanics:
 * - Steal targeting
 * - Revive targeting
 * - Amplification
 * - Combat resolution
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';
import type { StealTarget } from '@/types/gameplay';

interface CombatState {
  stealTargets: StealTarget[];
  reviveTargets: StealTarget[];
  attackerId: string | null;
  stealInProgress: boolean;
  fireBoostTaps: number;
}

export class CombatEngine implements EngineInterface {
  private state: CombatState = {
    stealTargets: [],
    reviveTargets: [],
    attackerId: null,
    stealInProgress: false,
    fireBoostTaps: 0,
  };

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    // When steal is activated, prepare for target selection
    gameplayEvents.on('STEAL_ACTIVATED', (event) => {
      const payload = event.payload as { targets: StealTarget[] };
      this.handleStealActivated(payload.targets);
    });

    // When steal target is selected
    gameplayEvents.on('STEAL_TARGET_SELECTED', (event) => {
      const payload = event.payload as { targetId: string };
      this.handleTargetSelected(payload.targetId);
    });

    // When steal is executed
    gameplayEvents.on('STEAL_EXECUTED', (event) => {
      const payload = event.payload as { success: boolean; amount: number };
      this.handleStealExecuted(payload.success, payload.amount);
    });

    // When revive is available
    gameplayEvents.on('REVIVE_AVAILABLE', (event) => {
      const payload = event.payload as { targets: StealTarget[] };
      this.handleReviveAvailable(payload.targets);
    });

    // When revive is triggered
    gameplayEvents.on('REVIVE_TRIGGERED', (event) => {
      const payload = event.payload as { targetId: string };
      this.handleReviveTriggered(payload.targetId);
    });
  }

  // ============================================================================
  // STEAL MECHANICS
  // ============================================================================

  private handleStealActivated(targets: StealTarget[]): void {
    this.state.stealTargets = targets;
    this.state.stealInProgress = true;
    
    console.log('[CombatEngine] Steal activated with', targets.length, 'targets');
  }

  private handleTargetSelected(targetId: string): void {
    const target = this.state.stealTargets.find(t => t.userId === targetId);
    if (!target) {
      console.warn('[CombatEngine] Target not found:', targetId);
      return;
    }

    console.log('[CombatEngine] Target selected:', target.username);
    
    // Emit event for execution
    gameplayEvents.emit({
      type: 'STEAL_TARGET_SELECTED',
      timestamp: Date.now(),
      source: 'player',
      payload: { targetId, target },
    });
  }

  private handleStealExecuted(success: boolean, amount: number): void {
    if (success) {
      console.log('[CombatEngine] Steal successful! Amount:', amount);
    } else {
      console.log('[CombatEngine] Steal failed or blocked');
    }

    this.state.stealInProgress = false;
    this.state.stealTargets = [];
    this.state.fireBoostTaps = 0;

    gameplayEvents.emit({
      type: 'STEAL_RESOLVED',
      timestamp: Date.now(),
      source: 'runtime',
      payload: { success, amount },
    });
  }

  // ============================================================================
  // REVIVE MECHANICS
  // ============================================================================

  private handleReviveAvailable(targets: StealTarget[]): void {
    this.state.reviveTargets = targets;
    
    console.log('[CombatEngine] Revive available with', targets.length, 'targets');

    gameplayEvents.emit({
      type: 'REVIVE_AVAILABLE',
      timestamp: Date.now(),
      source: 'server',
      payload: { targets },
    });
  }

  private handleReviveTriggered(targetId: string): void {
    const target = this.state.reviveTargets.find(t => t.userId === targetId);
    if (!target) {
      console.warn('[CombatEngine] Revive target not found:', targetId);
      return;
    }

    console.log('[CombatEngine] Reviving:', target.username);

    this.state.reviveTargets = [];

    gameplayEvents.emit({
      type: 'REVIVE_COMPLETED',
      timestamp: Date.now(),
      source: 'runtime',
      payload: { targetId, target },
    });
  }

  // ============================================================================
  // FIRE BOOST
  // ============================================================================

  incrementFireBoost(): void {
    this.state.fireBoostTaps++;
    
    console.log('[CombatEngine] Fire boost taps:', this.state.fireBoostTaps);
  }

  resetFireBoost(): void {
    this.state.fireBoostTaps = 0;
  }

  getFireBoostMultiplier(): number {
    // Each tap increases by 10%, capped at 50%
    return Math.min(1.5, 1.0 + (this.state.fireBoostTaps * 0.1));
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  selectStealTarget(targetId: string): void {
    this.handleTargetSelected(targetId);
  }

  selectReviveTarget(targetId: string): void {
    this.handleReviveTriggered(targetId);
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getStealTargets(): StealTarget[] {
    return [...this.state.stealTargets];
  }

  getReviveTargets(): StealTarget[] {
    return [...this.state.reviveTargets];
  }

  isStealInProgress(): boolean {
    return this.state.stealInProgress;
  }

  getAttackerId(): string | null {
    return this.state.attackerId;
  }

  setAttackerId(id: string | null): void {
    this.state.attackerId = id;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  handleEvent(_event: GameplayEvent): void {
    // Events handled via setupListeners
  }

  reset(): void {
    this.state = {
      stealTargets: [],
      reviveTargets: [],
      attackerId: null,
      stealInProgress: false,
      fireBoostTaps: 0,
    };
  }
}

export const combatEngine = new CombatEngine();
