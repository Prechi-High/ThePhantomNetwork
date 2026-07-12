/**
 * Reward Engine
 * 
 * Owns all reward processing:
 * - Token updates
 * - Payouts
 * - Reward animations
 * - Prize distribution
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';

interface RewardState {
  totalEarned: number;
  pendingPayout: number;
  lastRewardTimestamp: number | null;
  rewardHistory: RewardEntry[];
}

interface RewardEntry {
  id: string;
  type: 'spin' | 'steal' | 'bonus' | 'phase' | 'final';
  amount: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class RewardEngine implements EngineInterface {
  private state: RewardState = {
    totalEarned: 0,
    pendingPayout: 0,
    lastRewardTimestamp: null,
    rewardHistory: [],
  };

  private maxHistorySize: number = 50;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    // Process rewards after token collection
    gameplayEvents.on('TOKEN_COLLECTION_COMPLETED', (event) => {
      const payload = event.payload as { totalCollected: number };
      this.processReward('spin', payload.totalCollected);
    });

    // Process steal rewards
    gameplayEvents.on('STEAL_RESOLVED', (event) => {
      const payload = event.payload as { success: boolean; amount: number };
      if (payload.success && payload.amount > 0) {
        this.processReward('steal', payload.amount);
      }
    });

    // Process phase completion rewards (if any)
    gameplayEvents.on('PHASE_COMPLETED', (event) => {
      const payload = event.payload as { phase: number };
      // Phase rewards could be added here
      console.log('[RewardEngine] Phase completed:', payload.phase);
    });

    // Session complete - calculate final payout
    gameplayEvents.on('SESSION_COMPLETED', () => {
      this.finalizePayout();
    });
  }

  // ============================================================================
  // REWARD PROCESSING
  // ============================================================================

  processReward(type: RewardEntry['type'], amount: number, metadata?: Record<string, unknown>): void {
    if (amount <= 0) return;

    const entry: RewardEntry = {
      id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      amount,
      timestamp: Date.now(),
      metadata,
    };

    this.state.rewardHistory.unshift(entry);
    
    // Trim history
    if (this.state.rewardHistory.length > this.maxHistorySize) {
      this.state.rewardHistory = this.state.rewardHistory.slice(0, this.maxHistorySize);
    }

    this.state.totalEarned += amount;
    this.state.lastRewardTimestamp = entry.timestamp;

    console.log('[RewardEngine] Reward processed:', type, 'amount:', amount);

    // Emit reward event
    gameplayEvents.emit({
      type: 'HUD_REFRESH',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        type: 'reward',
        amount,
        total: this.state.totalEarned,
      },
    });
  }

  // ============================================================================
  // PAYOUT
  // ============================================================================

  setPendingPayout(amount: number): void {
    this.state.pendingPayout = amount;
    console.log('[RewardEngine] Pending payout set:', amount);
  }

  private finalizePayout(): void {
    if (this.state.pendingPayout > 0) {
      console.log('[RewardEngine] Finalizing payout:', this.state.pendingPayout);
      
      // In a real implementation, this would trigger a payout API call
      // For now, we just log the final payout
    }
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getTotalEarned(): number {
    return this.state.totalEarned;
  }

  getPendingPayout(): number {
    return this.state.pendingPayout;
  }

  getRewardHistory(): RewardEntry[] {
    return [...this.state.rewardHistory];
  }

  getRecentRewards(count: number = 10): RewardEntry[] {
    return this.state.rewardHistory.slice(0, count);
  }

  getLastRewardTimestamp(): number | null {
    return this.state.lastRewardTimestamp;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  handleEvent(_event: GameplayEvent): void {
    // Events handled via setupListeners
  }

  reset(): void {
    this.state = {
      totalEarned: 0,
      pendingPayout: 0,
      lastRewardTimestamp: null,
      rewardHistory: [],
    };
  }
}

export const rewardEngine = new RewardEngine();
