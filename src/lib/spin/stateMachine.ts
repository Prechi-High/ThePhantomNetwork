/**
 * Premium Spin Wheel State Machine
 * Explicit state management to prevent race conditions and ensure proper sequencing
 */

export type SpinState =
  | 'IDLE'
  | 'SPIN_START'
  | 'SPINNING'
  | 'DECELERATING'
  | 'LOCKED'
  | 'REVEAL_START'
  | 'OUTCOME_REVEAL'
  | 'TOKEN_COLLECTION'
  | 'STEAL_SELECTION'
  | 'REVEAL_COMPLETE'
  | 'COOLDOWN'
  | 'READY';

export type SpinEvent =
  | 'START_SPIN'
  | 'SPIN_COMPLETE'
  | 'REVEAL_BEGIN'
  | 'REVEAL_COMPLETE'
  | 'TOKENS_COLLECTED'
  | 'STEAL_SELECTED'
  | 'COOLDOWN_END'
  | 'RESET';

interface StateTransition {
  from: SpinState;
  event: SpinEvent;
  to: SpinState;
  guard?: () => boolean;
}

const transitions: StateTransition[] = [
  { from: 'IDLE', event: 'START_SPIN', to: 'SPIN_START' },
  { from: 'SPIN_START', event: 'SPIN_COMPLETE', to: 'SPINNING' },
  { from: 'SPINNING', event: 'SPIN_COMPLETE', to: 'DECELERATING' },
  { from: 'DECELERATING', event: 'SPIN_COMPLETE', to: 'LOCKED' },
  { from: 'LOCKED', event: 'REVEAL_BEGIN', to: 'REVEAL_START' },
  { from: 'REVEAL_START', event: 'REVEAL_COMPLETE', to: 'OUTCOME_REVEAL' },
  { from: 'OUTCOME_REVEAL', event: 'TOKENS_COLLECTED', to: 'TOKEN_COLLECTION' },
  { from: 'OUTCOME_REVEAL', event: 'STEAL_SELECTED', to: 'STEAL_SELECTION' },
  { from: 'TOKEN_COLLECTION', event: 'COOLDOWN_END', to: 'REVEAL_COMPLETE' },
  { from: 'STEAL_SELECTION', event: 'COOLDOWN_END', to: 'REVEAL_COMPLETE' },
  { from: 'REVEAL_COMPLETE', event: 'COOLDOWN_END', to: 'COOLDOWN' },
  { from: 'COOLDOWN', event: 'COOLDOWN_END', to: 'READY' },
  { from: 'READY', event: 'RESET', to: 'IDLE' },
];

export class SpinStateMachine {
  private currentState: SpinState = 'IDLE';
  private listeners: Map<SpinState, Set<(state: SpinState) => void>> = new Map();

  getCurrentState(): SpinState {
    return this.currentState;
  }

  canTransition(event: SpinEvent): boolean {
    const transition = transitions.find(
      (t) => t.from === this.currentState && t.event === event
    );
    
    if (!transition) return false;
    if (transition.guard && !transition.guard()) return false;
    
    return true;
  }

  transition(event: SpinEvent): boolean {
    const transition = transitions.find(
      (t) => t.from === this.currentState && t.event === event
    );

    if (!transition) {
      console.warn(`[SpinStateMachine] Invalid transition: ${this.currentState} -> ${event}`);
      return false;
    }

    if (transition.guard && !transition.guard()) {
      console.warn(`[SpinStateMachine] Transition guard failed: ${this.currentState} -> ${event}`);
      return false;
    }

    const previousState = this.currentState;
    this.currentState = transition.to;

    console.log(`[SpinStateMachine] ${previousState} --[${event}]--> ${this.currentState}`);

    // Notify listeners
    this.notifyListeners(this.currentState);

    return true;
  }

  on(state: SpinState, callback: (state: SpinState) => void): () => void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(state)?.delete(callback);
    };
  }

  private notifyListeners(state: SpinState): void {
    this.listeners.get(state)?.forEach((callback) => callback(state));
  }

  reset(): void {
    this.currentState = 'IDLE';
    this.notifyListeners(this.currentState);
  }

  // Utility methods for common state checks
  isSpinning(): boolean {
    return ['SPIN_START', 'SPINNING', 'DECELERATING'].includes(this.currentState);
  }

  isRevealing(): boolean {
    return ['REVEAL_START', 'OUTCOME_REVEAL'].includes(this.currentState);
  }

  isLocked(): boolean {
    return this.currentState === 'LOCKED' || this.isSpinning() || this.isRevealing();
  }

  canSpin(): boolean {
    return this.currentState === 'IDLE' || this.currentState === 'READY';
  }
}
