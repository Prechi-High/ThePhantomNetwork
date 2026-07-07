/**
 * Gameplay Event Type Constants
 * 
 * Use these to emit and subscribe to events.
 * Prevents typos and makes event names discoverable.\n */

export const GAMEPLAY_EVENTS = {
  // Spin/Wheel events
  SPIN: {
    STARTED: 'spin.started',
    COMPLETED: 'spin.completed',
  },

  // Spin outcome events (wheel landed on outcome)
  OUTCOME: {
    ADVANCE: 'spin.outcome.advance',
    ACQUIRE: 'spin.outcome.acquire',
    DISCOVER: 'spin.outcome.discover',
    STEAL: 'spin.outcome.steal',
    VOID: 'spin.outcome.void',
  },

  // Token events
  TOKENS: {
    COLLECTED: 'tokens.collected',
  },

  // Phase events
  PHASE: {
    STARTED: 'phase.started',
    COMPLETED: 'phase.completed',
  },

  // Player events
  PLAYER: {
    ELIMINATED: 'player.eliminated',
  },

  // Special events
  SHADOW_SURGE: {
    ACTIVATED: 'shadow_surge.activated',
  },
} as const;

/**
 * Type-safe event type
 * Use for stronger typing in event listeners
 */
export type GameplayEventType = typeof GAMEPLAY_EVENTS[keyof typeof GAMEPLAY_EVENTS][keyof typeof GAMEPLAY_EVENTS[keyof typeof GAMEPLAY_EVENTS]];
