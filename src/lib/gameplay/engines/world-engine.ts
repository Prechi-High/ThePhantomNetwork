/**
 * World Engine
 * 
 * Owns the living world:
 * - Live feed
 * - Leaderboard
 * - Rival activity
 * - Squad updates
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';

export interface LiveFeedEvent {
  id: string;
  type: 'elimination' | 'steal' | 'revive' | 'phase_change' | 'token_milestone';
  message: string;
  playerId?: string;
  playerName?: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  tokens: number;
  isSquadMember?: boolean;
}

export interface SquadMember {
  userId: string;
  username: string;
  tokens: number;
  isEliminated: boolean;
}

export class WorldEngine implements EngineInterface {
  private liveFeed: LiveFeedEvent[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private squadMembers: SquadMember[] = [];
  private playerRank: number = 0;
  private totalPlayers: number = 0;

  private maxFeedSize: number = 50;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    // Update world on outcome reveal
    gameplayEvents.on('OUTCOME_REVEAL', () => {
      this.refreshWorld();
    });

    // Clear and refresh on phase change
    gameplayEvents.on('PHASE_STARTED', () => {
      this.refreshWorld();
    });
  }

  // ============================================================================
  // LIVE FEED
  // ============================================================================

  addFeedEvent(event: LiveFeedEvent): void {
    this.liveFeed.unshift(event);
    
    // Trim to max size
    if (this.liveFeed.length > this.maxFeedSize) {
      this.liveFeed = this.liveFeed.slice(0, this.maxFeedSize);
    }

    gameplayEvents.emit({
      type: 'LIVE_FEED_UPDATE',
      timestamp: Date.now(),
      source: 'server',
      payload: { events: [event] },
    });
  }

  updateFeed(events: LiveFeedEvent[]): void {
    events.forEach(event => {
      if (!this.liveFeed.find(e => e.id === event.id)) {
        this.liveFeed.unshift(event);
      }
    });

    this.liveFeed = this.liveFeed.slice(0, this.maxFeedSize);

    gameplayEvents.emit({
      type: 'LIVE_FEED_UPDATE',
      timestamp: Date.now(),
      source: 'server',
      payload: { events },
    });
  }

  getFeed(): LiveFeedEvent[] {
    return [...this.liveFeed];
  }

  clearFeed(): void {
    this.liveFeed = [];
  }

  // ============================================================================
  // LEADERBOARD
  // ============================================================================

  updateLeaderboard(entries: LeaderboardEntry[], playerRank: number): void {
    this.leaderboard = entries;
    this.playerRank = playerRank;

    gameplayEvents.emit({
      type: 'LEADERBOARD_UPDATE',
      timestamp: Date.now(),
      source: 'server',
      payload: {
        rankings: entries,
        playerRank,
      },
    });
  }

  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  getPlayerRank(): number {
    return this.playerRank;
  }

  getTopPlayers(count: number = 10): LeaderboardEntry[] {
    return this.leaderboard.slice(0, count);
  }

  // ============================================================================
  // SQUAD
  // ============================================================================

  updateSquad(members: SquadMember[]): void {
    this.squadMembers = members;

    gameplayEvents.emit({
      type: 'SQUAD_UPDATE',
      timestamp: Date.now(),
      source: 'server',
      payload: { members },
    });
  }

  getSquad(): SquadMember[] {
    return [...this.squadMembers];
  }

  getSquadAliveCount(): number {
    return this.squadMembers.filter(m => !m.isEliminated).length;
  }

  // ============================================================================
  // WORLD REFRESH
  // ============================================================================

  private refreshWorld(): void {
    gameplayEvents.emit({
      type: 'LIVE_WORLD_REFRESH',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        feedSize: this.liveFeed.length,
        leaderboardSize: this.leaderboard.length,
        squadSize: this.squadMembers.length,
      },
    });
  }

  setTotalPlayers(count: number): void {
    this.totalPlayers = count;
  }

  getTotalPlayers(): number {
    return this.totalPlayers;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  handleEvent(event: GameplayEvent): void {
    switch (event.type) {
      case 'TOKEN_COLLECTION_COMPLETED':
        // Add token milestone to feed if significant
        // This is handled by the game logic
        break;
    }
  }

  reset(): void {
    this.liveFeed = [];
    this.leaderboard = [];
    this.squadMembers = [];
    this.playerRank = 0;
    this.totalPlayers = 0;
  }
}

export const worldEngine = new WorldEngine();
