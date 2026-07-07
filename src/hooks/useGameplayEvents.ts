'use client';

import { gameplayEventBus, type GameplayEvent } from '@/lib/events/GameplayEventBus';

type GameplayEventListener = (event: GameplayEvent) => void;

/**
 * Hook for components to subscribe to gameplay events
 * 
 * Usage:
 * ```
 * const { on, emit } = useGameplayEvents();
 * 
 * useEffect(() => {
 *   const unsubscribe = on('spin.outcome.advance', (event) => {
 *     console.log('Advanced!', event.payload);
 *   });
 *   return unsubscribe;
 * }, []);
 * 
 * emit('spin.started', { playerId: 'user123' });
 * ```
 */
export function useGameplayEvents() {
  /**
   * Subscribe to an event
   * Automatically unsubscribes on unmount
   */
  const on = (type: string, listener: GameplayEventListener): (() => void) => {
    return gameplayEventBus.on(type, listener);
  };

  /**
   * Emit an event
   */
  const emit = (type: string, payload?: Record<string, unknown>): void => {
    gameplayEventBus.emit(type, payload);
  };

  return { on, emit, gameplayEventBus };
}