/**
 * useGameplayRuntime Hook
 * 
 * React hook to interact with the Gameplay Runtime.
 * Components should use this hook instead of accessing the runtime directly.
 */

import { useCallback, useEffect, useState } from 'react';
import { gameplayRuntime } from '@/lib/gameplay/runtime';
import { gameplayEvents, type GameplayState, type GameplayEvent } from '@/lib/gameplay/events';
import type { SpinOutcome } from '@/types/gameplay';

interface UseGameplayRuntimeReturn {
  // State
  currentState: GameplayState;
  isSpinning: boolean;
  canSpin: boolean;
  tokens: number;
  
  // Actions
  requestSpin: () => Promise<boolean>;
  receiveOutcome: (outcome: SpinOutcome, tokenDelta: number, newTotal: number) => void;
  
  // Subscriptions
  subscribe: (eventType: GameplayEvent['type'], handler: (event: GameplayEvent) => void) => () => void;
  subscribeAll: (handler: (event: GameplayEvent) => void) => () => void;
}

export function useGameplayRuntime(): UseGameplayRuntimeReturn {
  const [currentState, setCurrentState] = useState<GameplayState>(
    gameplayRuntime.getCurrentState()
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [tokens, setTokens] = useState(0);

  // Subscribe to state transitions
  useEffect(() => {
    const unsubscribe = gameplayEvents.on('STATE_TRANSITION', (event) => {
      const payload = event.payload as { toState: GameplayState };
      setCurrentState(payload.toState);
      
      // Update derived state
      setIsSpinning(
        ['SPIN_ACCELERATION', 'SPIN_HIGH_SPEED', 'SPIN_DECELERATION', 'POINTER_LOCK'].includes(
          payload.toState
        )
      );
      setCanSpin(payload.toState === 'READY');
    });

    return unsubscribe;
  }, []);

  // Subscribe to token updates
  useEffect(() => {
    const unsubscribe = gameplayEvents.on('TOKEN_COLLECTION_COMPLETED', (event) => {
      const payload = event.payload as { totalCollected: number };
      setTokens((prev) => prev + payload.totalCollected);
    });

    return unsubscribe;
  }, []);

  // Subscribe to outcome received
  useEffect(() => {
    const unsubscribe = gameplayEvents.on('OUTCOME_RECEIVED', (event) => {
      const payload = event.payload as { newTokenTotal: number };
      setTokens(payload.newTokenTotal);
    });

    return unsubscribe;
  }, []);

  // Actions
  const requestSpin = useCallback(async (): Promise<boolean> => {
    return gameplayRuntime.requestSpin();
  }, []);

  const receiveOutcome = useCallback(
    (outcome: SpinOutcome, tokenDelta: number, newTotal: number) => {
      gameplayRuntime.receiveOutcome(outcome, tokenDelta, newTotal);
    },
    []
  );

  // Subscription helpers
  const subscribe = useCallback(
    (eventType: GameplayEvent['type'], handler: (event: GameplayEvent) => void) => {
      return gameplayEvents.on(eventType, handler);
    },
    []
  );

  const subscribeAll = useCallback((handler: (event: GameplayEvent) => void) => {
    return gameplayEvents.onAll(handler);
  }, []);

  return {
    currentState,
    isSpinning,
    canSpin,
    tokens,
    requestSpin,
    receiveOutcome,
    subscribe,
    subscribeAll,
  };
}

/**
 * Hook to subscribe to a specific gameplay event
 */
export function useGameplayEvent(
  eventType: GameplayEvent['type'],
  handler: (event: GameplayEvent) => void
): void {
  useEffect(() => {
    return gameplayEvents.on(eventType, handler);
  }, [eventType, handler]);
}

/**
 * Hook to track the current gameplay state
 */
export function useGameplayState(): GameplayState {
  const [state, setState] = useState<GameplayState>(gameplayRuntime.getCurrentState());

  useEffect(() => {
    return gameplayEvents.on('STATE_TRANSITION', (event) => {
      const payload = event.payload as { toState: GameplayState };
      setState(payload.toState);
    });
  }, []);

  return state;
}
