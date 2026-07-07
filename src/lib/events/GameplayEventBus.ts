/**
 * Gameplay Event Bus
 * 
 * Central event system for all major gameplay moments.
 * Components emit events, and external systems (sound, animation, haptics) subscribe.
 * 
 * This decouples gameplay logic from animations, sounds, and other effects.
 */

export interface GameplayEvent {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

type GameplayEventListener = (event: GameplayEvent) => void;

class GameplayEventBusImpl {
  private listeners: Map<string, GameplayEventListener[]> = new Map();

  /**
   * Emit an event to all subscribed listeners
   */
  emit(type: string, payload?: Record<string, unknown>): void {
    const event: GameplayEvent = {
      type,
      timestamp: Date.now(),
      payload,
    };

    const typeListeners = this.listeners.get(type);
    if (!typeListeners) return;

    // Call all listeners for this event type
    typeListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in listener for event ${type}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event type
   * Returns an unsubscribe function
   */
  on(type: string, listener: GameplayEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(listener);

    // Return unsubscribe function
    return () => {
      this.off(type, listener);
    };
  }

  /**
   * Unsubscribe from an event type
   */
  off(type: string, listener: GameplayEventListener): void {
    const typeListeners = this.listeners.get(type);
    if (!typeListeners) return;

    const index = typeListeners.indexOf(listener);
    if (index > -1) {
      typeListeners.splice(index, 1);
    }
  }

  /**
   * Remove all listeners (useful for cleanup/testing)
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const gameplayEventBus = new GameplayEventBusImpl();
