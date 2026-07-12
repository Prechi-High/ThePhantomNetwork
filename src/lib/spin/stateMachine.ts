/**
 * ============================================================================
 * THE PHANTOM NETWORK — CANONICAL GAMEPLAY STATE MACHINE
 * ============================================================================
 *
 * This is the single source of truth for the gameplay lifecycle.
 * The wheel is NOT the center. The gameplay engine is.
 *
 * Every state has:
 *   - One clear responsibility
 *   - Allowed previous states (entry guard)
 *   - Allowed next states (exit options)
 *   - Timeout rule
 *   - Cancellation rule
 *   - Recovery path
 *
 * Rules:
 *   - Components never drive state transitions directly.
 *   - Only the Gameplay Runtime calls transition().
 *   - States are sequenced, not jumped.
 * ============================================================================
 */

import { SPIN_TIMINGS, REVEAL_TIMINGS } from '@/config/spinConfig';

// ============================================================================
// STATE DEFINITIONS
// ============================================================================

export type GameplayLifecycleState =
  // — Session Boot —
  | 'SESSION_LOADING'     // Loading session, syncing server time, loading inventory
  | 'NETWORK_ENTRY'       // Cinematic intro — no gameplay yet
  | 'SESSION_READY'       // Session data loaded, waiting for phase to open

  // — Round Management —
  | 'ROUND_READY'         // Phase is open, countdown running, button unlocked

  // — Player Spin Request —
  | 'PLAYER_READY'        // Player can press engage — all conditions met
  | 'SPIN_REQUESTED'      // Engage pressed — button disabled, cooldown checked
  | 'SERVER_VALIDATION'   // Backend deciding if spin is allowed

  // — Wheel Animation —
  | 'SPIN_START'          // Animation begins — server outcome not shown yet
  | 'SPIN_ACCELERATION'   // Wheel accelerating to max speed
  | 'SPIN_HIGH_SPEED'     // Wheel at cruise speed
  | 'SPIN_DECELERATION'   // Wheel braking
  | 'POINTER_ENGAGEMENT'  // Needle interacting with segments
  | 'FINAL_LOCK'          // Wheel fully stopped — segment locked

  // — Reveal Sequence —
  | 'SUSPENSE'            // 300ms silence — tension building
  | 'REVEAL_PRELOAD'      // Energy formation around outcome segment
  | 'REVEAL'              // Outcome card explodes into view
  | 'OUTCOME_RESOLUTION'  // Store updates only — no animation here

  // — World Reaction —
  | 'WORLD_UPDATE'        // Live feed, leaderboard, squad all react
  | 'HUD_UPDATE'          // HUD token counter, rank, phase timer refresh

  // — Reward Collection —
  | 'TOKEN_COLLECTION'    // Token flight animation

  // — Post-Spin Effects —
  | 'POST_EFFECTS'        // Shield/cloak/boost resolve, steal targeting

  // — Loop —
  | 'NEXT_SPIN_READY'     // All animations settled — back to PLAYER_READY

  // — Terminal —
  | 'SESSION_PAUSED'      // Server-side pause
  | 'SESSION_ENDED'       // Session completed — no more spins

  // — Error Recovery —
  | 'ERROR_NETWORK'       // Network timeout — awaiting reconnect
  | 'ERROR_SERVER_REJECT' // Server rejected spin — brief message + PLAYER_READY
  | 'ERROR_DESYNC'        // State out of sync — force refresh
  | 'ERROR_REVEAL_FAIL';  // Reveal interrupted — recover to NEXT_SPIN_READY

// ============================================================================
// EVENTS (what drives transitions)
// ============================================================================

export type GameplayEvent =
  // Session events
  | 'SESSION_JOINED'
  | 'SESSION_SYNCED'
  | 'SESSION_STARTED'
  | 'SESSION_PAUSED'
  | 'SESSION_RESUMED'
  | 'SESSION_ENDED'

  // Round events
  | 'ROUND_STARTED'
  | 'ROUND_WARNING'
  | 'ROUND_FINISHED'

  // Spin events
  | 'SPIN_REQUEST'
  | 'SPIN_GRANTED'
  | 'SPIN_REJECTED'
  | 'SPIN_STARTED'
  | 'SPIN_MAX_SPEED'
  | 'SPIN_BRAKE'
  | 'SPIN_LOCK'
  | 'SPIN_COMPLETE'

  // Reveal events
  | 'REVEAL_PRELOAD'
  | 'LIGHT_FLASH'
  | 'OUTCOME_REVEAL'
  | 'CARD_EXPAND'
  | 'OUTCOME_CONFIRMED'

  // HUD events
  | 'HUD_REFRESH'
  | 'HUD_ANIMATE'
  | 'HUD_SETTLED'

  // World events
  | 'LEADERBOARD_CHANGED'
  | 'LIVE_FEED_PUSH'
  | 'SQUAD_ACTIVITY'
  | 'RIVAL_ACTIVITY'

  // Effects & Combat
  | 'SHIELD_TRIGGERED'
  | 'CLOAK_ACTIVATED'
  | 'INSURANCE_USED'
  | 'BOOST_USED'
  | 'STEAL_AVAILABLE'
  | 'STEAL_SELECTED'
  | 'STEAL_RESOLVED'
  | 'REVIVE_STARTED'
  | 'REVIVE_COMPLETED'

  // Utility
  | 'NEXT_SPIN'
  | 'ERROR_OCCURRED'
  | 'ERROR_RECOVERED'
  | 'RESET';

// ============================================================================
// TRANSITION DEFINITION
// ============================================================================

interface TransitionRule {
  /** States that are allowed to lead into this one */
  allowedFrom: GameplayLifecycleState[];
  /** States this state can transition to */
  allowedTo: GameplayLifecycleState[];
  /** Max ms the state may remain active (null = no limit) */
  timeoutMs: number | null;
  /** Can external code interrupt this state mid-way? */
  canInterrupt: boolean;
  /** Recovery state if something goes wrong here */
  recoveryState: GameplayLifecycleState;
  /** Single responsibility description */
  owns: string;
}

const STATE_RULES: Record<GameplayLifecycleState, TransitionRule> = {
  // ---- SESSION BOOT ----
  SESSION_LOADING: {
    allowedFrom: ['SESSION_ENDED', 'ERROR_DESYNC'],
    allowedTo: ['NETWORK_ENTRY', 'ERROR_NETWORK', 'ERROR_DESYNC'],
    timeoutMs: 15_000,
    canInterrupt: false,
    recoveryState: 'ERROR_NETWORK',
    owns: 'Load session, sync server time, load inventory, load squad, load leaderboard',
  },
  NETWORK_ENTRY: {
    allowedFrom: ['SESSION_LOADING'],
    allowedTo: ['SESSION_READY'],
    timeoutMs: 5_000,
    canInterrupt: false,
    recoveryState: 'SESSION_READY',
    owns: 'Cinematic network intro animation only — no gameplay',
  },
  SESSION_READY: {
    allowedFrom: ['NETWORK_ENTRY', 'SESSION_PAUSED', 'ERROR_NETWORK'],
    allowedTo: ['ROUND_READY', 'SESSION_ENDED'],
    timeoutMs: null,
    canInterrupt: true,
    recoveryState: 'ERROR_DESYNC',
    owns: 'Session data loaded — wait for phase to open',
  },

  // ---- ROUND MANAGEMENT ----
  ROUND_READY: {
    allowedFrom: ['SESSION_READY', 'NEXT_SPIN_READY', 'ERROR_SERVER_REJECT'],
    allowedTo: ['PLAYER_READY', 'SESSION_ENDED', 'SESSION_PAUSED'],
    timeoutMs: null,
    canInterrupt: true,
    recoveryState: 'SESSION_READY',
    owns: 'Phase is open — countdown running, unlock button, sync skills',
  },
  PLAYER_READY: {
    allowedFrom: ['ROUND_READY', 'NEXT_SPIN_READY'],
    allowedTo: ['SPIN_REQUESTED', 'SESSION_ENDED', 'SESSION_PAUSED'],
    timeoutMs: null,
    canInterrupt: true,
    recoveryState: 'ROUND_READY',
    owns: 'Player can press engage — all pre-conditions satisfied',
  },

  // ---- SPIN REQUEST ----
  SPIN_REQUESTED: {
    allowedFrom: ['PLAYER_READY'],
    allowedTo: ['SERVER_VALIDATION', 'ERROR_SERVER_REJECT'],
    timeoutMs: 5_000,
    canInterrupt: false,
    recoveryState: 'ERROR_SERVER_REJECT',
    owns: 'Disable engage button, validate cooldown, verify player alive & phase active',
  },
  SERVER_VALIDATION: {
    allowedFrom: ['SPIN_REQUESTED'],
    allowedTo: ['SPIN_START', 'ERROR_SERVER_REJECT'],
    timeoutMs: 8_000,
    canInterrupt: false,
    recoveryState: 'ERROR_SERVER_REJECT',
    owns: 'Backend decides outcome — client only waits',
  },

  // ---- WHEEL ANIMATION ----
  SPIN_START: {
    allowedFrom: ['SERVER_VALIDATION'],
    allowedTo: ['SPIN_ACCELERATION'],
    timeoutMs: SPIN_TIMINGS.IMPULSE_DURATION + 200,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Animation begins — outcome data arrives but is hidden',
  },
  SPIN_ACCELERATION: {
    allowedFrom: ['SPIN_START'],
    allowedTo: ['SPIN_HIGH_SPEED'],
    timeoutMs: SPIN_TIMINGS.FAST_SPIN_START - SPIN_TIMINGS.IMPULSE_DURATION + 500,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Wheel accelerates from zero to max angular velocity',
  },
  SPIN_HIGH_SPEED: {
    allowedFrom: ['SPIN_ACCELERATION'],
    allowedTo: ['SPIN_DECELERATION'],
    timeoutMs: SPIN_TIMINGS.FAST_SPIN_END - SPIN_TIMINGS.FAST_SPIN_START + 500,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Wheel at cruise speed — full camera blur, ambient particles',
  },
  SPIN_DECELERATION: {
    allowedFrom: ['SPIN_HIGH_SPEED'],
    allowedTo: ['POINTER_ENGAGEMENT'],
    timeoutMs: SPIN_TIMINGS.SLOWDOWN_END - SPIN_TIMINGS.SLOWDOWN_START + 500,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Wheel braking — brake audio plays',
  },
  POINTER_ENGAGEMENT: {
    allowedFrom: ['SPIN_DECELERATION'],
    allowedTo: ['FINAL_LOCK'],
    timeoutMs: SPIN_TIMINGS.STOP_END - SPIN_TIMINGS.STOP_START + 300,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Needle clicks across segment borders — tick sounds',
  },
  FINAL_LOCK: {
    allowedFrom: ['POINTER_ENGAGEMENT'],
    allowedTo: ['SUSPENSE'],
    timeoutMs: 600,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Wheel fully stopped — segment locked, micro-bounce settles',
  },

  // ---- REVEAL SEQUENCE ----
  SUSPENSE: {
    allowedFrom: ['FINAL_LOCK'],
    allowedTo: ['REVEAL_PRELOAD'],
    timeoutMs: REVEAL_TIMINGS.SUSPENSE_PAUSE + 100,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: '300ms silence — maximum tension before reveal',
  },
  REVEAL_PRELOAD: {
    allowedFrom: ['SUSPENSE'],
    allowedTo: ['REVEAL'],
    timeoutMs: REVEAL_TIMINGS.ENERGY_FORMATION_END - REVEAL_TIMINGS.ENERGY_FORMATION_START + 300,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Golden energy forms around locked segment — light burst erupts',
  },
  REVEAL: {
    allowedFrom: ['REVEAL_PRELOAD'],
    allowedTo: ['OUTCOME_RESOLUTION'],
    timeoutMs: REVEAL_TIMINGS.REVEAL_COMPLETE_AT - REVEAL_TIMINGS.CARD_ENTRY_START + 500,
    canInterrupt: false,
    recoveryState: 'ERROR_REVEAL_FAIL',
    owns: 'Outcome card explodes into view — particles start — player reads result',
  },
  OUTCOME_RESOLUTION: {
    allowedFrom: ['REVEAL'],
    allowedTo: ['WORLD_UPDATE'],
    timeoutMs: 500,
    canInterrupt: false,
    recoveryState: 'NEXT_SPIN_READY',
    owns: 'Store updates only — no animation — tokens, rank, phase committed to state',
  },

  // ---- WORLD REACTION ----
  WORLD_UPDATE: {
    allowedFrom: ['OUTCOME_RESOLUTION'],
    allowedTo: ['HUD_UPDATE'],
    timeoutMs: 1_000,
    canInterrupt: true,
    recoveryState: 'HUD_UPDATE',
    owns: 'Live feed, leaderboard, squad, and rivals all react to the outcome',
  },
  HUD_UPDATE: {
    allowedFrom: ['WORLD_UPDATE'],
    allowedTo: ['TOKEN_COLLECTION'],
    timeoutMs: 800,
    canInterrupt: true,
    recoveryState: 'TOKEN_COLLECTION',
    owns: 'HUD token counter, rank badge, and phase timer refresh with animations',
  },

  // ---- TOKEN COLLECTION ----
  TOKEN_COLLECTION: {
    allowedFrom: ['HUD_UPDATE'],
    allowedTo: ['POST_EFFECTS'],
    timeoutMs: 2_500,
    canInterrupt: false,
    recoveryState: 'POST_EFFECTS',
    owns: 'Token particles fly from wheel to counter — counter increments',
  },

  // ---- POST EFFECTS ----
  POST_EFFECTS: {
    allowedFrom: ['TOKEN_COLLECTION'],
    allowedTo: ['NEXT_SPIN_READY'],
    timeoutMs: 3_000,
    canInterrupt: true,
    recoveryState: 'NEXT_SPIN_READY',
    owns: 'Shield/cloak/boost resolve, steal target selection, revive prompt',
  },

  // ---- LOOP ----
  NEXT_SPIN_READY: {
    allowedFrom: ['POST_EFFECTS', 'ERROR_REVEAL_FAIL'],
    allowedTo: ['PLAYER_READY', 'ROUND_READY', 'SESSION_ENDED'],
    timeoutMs: null,
    canInterrupt: true,
    recoveryState: 'ROUND_READY',
    owns: 'All animations settled — ready for next engage press',
  },

  // ---- TERMINAL ----
  SESSION_PAUSED: {
    allowedFrom: [
      'ROUND_READY', 'PLAYER_READY', 'SESSION_READY',
      'NEXT_SPIN_READY', 'WORLD_UPDATE', 'HUD_UPDATE',
    ],
    allowedTo: ['SESSION_READY', 'SESSION_ENDED'],
    timeoutMs: null,
    canInterrupt: true,
    recoveryState: 'SESSION_READY',
    owns: 'Server-issued pause — show pause screen, disable all inputs',
  },
  SESSION_ENDED: {
    allowedFrom: [
      'SESSION_READY', 'ROUND_READY', 'PLAYER_READY', 'NEXT_SPIN_READY',
      'SESSION_PAUSED', 'POST_EFFECTS',
    ],
    allowedTo: [],
    timeoutMs: null,
    canInterrupt: false,
    recoveryState: 'SESSION_ENDED',
    owns: 'Session is over — show final results, redirect to profile',
  },

  // ---- ERROR RECOVERY ----
  ERROR_NETWORK: {
    allowedFrom: ['SESSION_LOADING', 'SERVER_VALIDATION', 'SPIN_REQUESTED'],
    allowedTo: ['SESSION_LOADING', 'SESSION_READY'],
    timeoutMs: 30_000,
    canInterrupt: true,
    recoveryState: 'SESSION_LOADING',
    owns: 'Show reconnecting UI — retry connection automatically',
  },
  ERROR_SERVER_REJECT: {
    allowedFrom: ['SPIN_REQUESTED', 'SERVER_VALIDATION'],
    allowedTo: ['ROUND_READY'],
    timeoutMs: 3_000,
    canInterrupt: true,
    recoveryState: 'ROUND_READY',
    owns: 'Server rejected spin — show brief error message, re-enable button',
  },
  ERROR_DESYNC: {
    allowedFrom: ['SESSION_READY', 'ROUND_READY', 'PLAYER_READY', 'NEXT_SPIN_READY'],
    allowedTo: ['SESSION_LOADING'],
    timeoutMs: 5_000,
    canInterrupt: false,
    recoveryState: 'SESSION_LOADING',
    owns: 'State is out of sync — force full refresh from server',
  },
  ERROR_REVEAL_FAIL: {
    allowedFrom: [
      'SPIN_START', 'SPIN_ACCELERATION', 'SPIN_HIGH_SPEED',
      'SPIN_DECELERATION', 'POINTER_ENGAGEMENT', 'FINAL_LOCK',
      'SUSPENSE', 'REVEAL_PRELOAD', 'REVEAL',
    ],
    allowedTo: ['NEXT_SPIN_READY'],
    timeoutMs: 2_000,
    canInterrupt: false,
    recoveryState: 'NEXT_SPIN_READY',
    owns: 'Reveal was interrupted — skip to next spin ready state gracefully',
  },
};

// ============================================================================
// STATE MACHINE CLASS
// ============================================================================

type StateListener = (state: GameplayLifecycleState, prev: GameplayLifecycleState) => void;

export class GameplayStateMachine {
  private current: GameplayLifecycleState = 'SESSION_LOADING';
  private previous: GameplayLifecycleState | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<StateListener> = new Set();
  private stateListeners: Map<GameplayLifecycleState, Set<StateListener>> = new Map();

  // ---- Core API ----

  get state(): GameplayLifecycleState {
    return this.current;
  }

  get prevState(): GameplayLifecycleState | null {
    return this.previous;
  }

  /**
   * Attempt a transition to `next`.
   * Returns true if the transition succeeded, false if it was blocked.
   */
  transition(next: GameplayLifecycleState, reason?: string): boolean {
    const rule = STATE_RULES[next];

    if (!rule.allowedFrom.includes(this.current) && rule.allowedFrom.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[StateMachine] Blocked: ${this.current} → ${next}` +
            (reason ? ` (${reason})` : '') +
            `\n  Allowed from: [${rule.allowedFrom.join(', ')}]`
        );
      }
      return false;
    }

    this.clearTimeout();

    const prev = this.current;
    this.previous = prev;
    this.current = next;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[StateMachine] ${prev} → ${next}` + (reason ? ` — ${reason}` : '')
      );
    }

    // Notify listeners
    this.listeners.forEach((fn) => fn(next, prev));
    this.stateListeners.get(next)?.forEach((fn) => fn(next, prev));

    // Set auto-timeout if defined
    if (rule.timeoutMs !== null) {
      this.timeoutHandle = setTimeout(() => {
        console.warn(
          `[StateMachine] Timeout in state ${this.current} after ${rule.timeoutMs}ms — recovering to ${rule.recoveryState}`
        );
        this.transition(rule.recoveryState, 'timeout recovery');
      }, rule.timeoutMs);
    }

    return true;
  }

  /**
   * Force-transition regardless of allowedFrom (use only for error recovery).
   */
  forceTransition(next: GameplayLifecycleState, reason: string): void {
    this.clearTimeout();
    const prev = this.current;
    this.previous = prev;
    this.current = next;

    console.warn(`[StateMachine] FORCED: ${prev} → ${next} — ${reason}`);
    this.listeners.forEach((fn) => fn(next, prev));
    this.stateListeners.get(next)?.forEach((fn) => fn(next, prev));
  }

  // ---- Subscriptions ----

  /** Subscribe to all state changes */
  onChange(fn: StateListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Subscribe to a specific state being entered */
  onEnter(state: GameplayLifecycleState, fn: StateListener): () => void {
    if (!this.stateListeners.has(state)) {
      this.stateListeners.set(state, new Set());
    }
    this.stateListeners.get(state)!.add(fn);
    return () => this.stateListeners.get(state)?.delete(fn);
  }

  // ---- Queries ----

  canTransitionTo(next: GameplayLifecycleState): boolean {
    const rule = STATE_RULES[next];
    return rule.allowedFrom.length === 0 || rule.allowedFrom.includes(this.current);
  }

  isSpinning(): boolean {
    return (
      this.current === 'SPIN_START' ||
      this.current === 'SPIN_ACCELERATION' ||
      this.current === 'SPIN_HIGH_SPEED' ||
      this.current === 'SPIN_DECELERATION' ||
      this.current === 'POINTER_ENGAGEMENT' ||
      this.current === 'FINAL_LOCK'
    );
  }

  isRevealing(): boolean {
    return (
      this.current === 'SUSPENSE' ||
      this.current === 'REVEAL_PRELOAD' ||
      this.current === 'REVEAL'
    );
  }

  isLocked(): boolean {
    return this.isSpinning() || this.isRevealing();
  }

  canSpin(): boolean {
    return this.current === 'PLAYER_READY';
  }

  isErrorState(): boolean {
    return (
      this.current === 'ERROR_NETWORK' ||
      this.current === 'ERROR_SERVER_REJECT' ||
      this.current === 'ERROR_DESYNC' ||
      this.current === 'ERROR_REVEAL_FAIL'
    );
  }

  isTerminal(): boolean {
    return this.current === 'SESSION_ENDED';
  }

  getRule(): TransitionRule {
    return STATE_RULES[this.current];
  }

  // ---- Lifecycle ----

  reset(): void {
    this.clearTimeout();
    this.previous = this.current;
    this.current = 'SESSION_LOADING';
    this.listeners.forEach((fn) => fn(this.current, this.previous!));
  }

  destroy(): void {
    this.clearTimeout();
    this.listeners.clear();
    this.stateListeners.clear();
  }

  private clearTimeout(): void {
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }
}

// ============================================================================
// SINGLETON + LEGACY COMPAT
// ============================================================================

/** Singleton used by the Gameplay Runtime */
export const gameplayStateMachine = new GameplayStateMachine();

// ---- Legacy type aliases ----

/** @deprecated Use GameplayLifecycleState instead */
export type SpinState = GameplayLifecycleState | LegacySpinState;

/** @deprecated Internal legacy states kept for backward compat */
type LegacySpinState =
  | 'IDLE'
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

/** @deprecated Use GameplayEvent instead */
export type SpinEvent = GameplayEvent | LegacySpinEvent;

/** @deprecated Internal legacy events kept for backward compat */
type LegacySpinEvent =
  | 'START_SPIN'
  | 'SPIN_COMPLETE'
  | 'REVEAL_BEGIN'
  | 'REVEAL_COMPLETE'
  | 'TOKENS_COLLECTED'
  | 'STEAL_SELECTED'
  | 'COOLDOWN_END'
  | 'RESET';

/** Maps old event names → new lifecycle state transitions */
const LEGACY_EVENT_MAP: Record<string, GameplayLifecycleState> = {
  START_SPIN: 'SPIN_START',
  SPIN_COMPLETE: 'SPIN_ACCELERATION',
  REVEAL_BEGIN: 'SUSPENSE',
  REVEAL_COMPLETE: 'REVEAL',
  TOKENS_COLLECTED: 'TOKEN_COLLECTION',
  STEAL_SELECTED: 'POST_EFFECTS',
  COOLDOWN_END: 'NEXT_SPIN_READY',
  RESET: 'SESSION_LOADING',
};

/** Maps old state names → new lifecycle states for string comparisons */
const LEGACY_STATE_MAP: Record<string, GameplayLifecycleState> = {
  IDLE: 'PLAYER_READY',
  SPINNING: 'SPIN_HIGH_SPEED',
  DECELERATING: 'SPIN_DECELERATION',
  LOCKED: 'FINAL_LOCK',
  REVEAL_START: 'REVEAL_PRELOAD',
  OUTCOME_REVEAL: 'REVEAL',
  TOKEN_COLLECTION: 'TOKEN_COLLECTION',
  STEAL_SELECTION: 'POST_EFFECTS',
  REVEAL_COMPLETE: 'NEXT_SPIN_READY',
  COOLDOWN: 'NEXT_SPIN_READY',
  READY: 'PLAYER_READY',
};

/**
 * @deprecated Use GameplayStateMachine directly.
 *
 * This class provides full backward compatibility with code that uses:
 *   - stateMachine.on(state, callback)
 *   - stateMachine.getCurrentState()
 *   - stateMachine.transition("OLD_EVENT_NAME")
 *   - stateMachine.canSpin()
 *   - stateMachine.isSpinning() / isRevealing() / isLocked()
 */
export class SpinStateMachine {
  private machine: GameplayStateMachine;
  /** Tracks legacy state string for components that read it directly */
  private legacyState: string = 'IDLE';
  private legacyListeners: Map<string, Set<(state: SpinState) => void>> = new Map();

  constructor() {
    this.machine = new GameplayStateMachine();

    // Keep legacyState in sync with any new-style transition
    this.machine.onChange((next) => {
      this.legacyState = next;
      // Notify legacy listeners registered for this state
      this.legacyListeners.get(next)?.forEach((fn) => fn(next as SpinState));
    });
  }

  /** @deprecated Use GameplayStateMachine.state */
  getCurrentState(): SpinState {
    return this.legacyState as SpinState;
  }

  /**
   * Accepts both legacy event names ('START_SPIN', 'SPIN_COMPLETE'…)
   * and new lifecycle state names.
   */
  transition(eventOrState: string): boolean {
    // Legacy event → map to new state
    if (LEGACY_EVENT_MAP[eventOrState]) {
      return this.machine.transition(LEGACY_EVENT_MAP[eventOrState], `legacy event: ${eventOrState}`);
    }
    // New-style state name passed directly
    if (eventOrState in STATE_RULES) {
      return this.machine.transition(eventOrState as GameplayLifecycleState, 'direct state');
    }
    console.warn(`[SpinStateMachine] Unknown transition: ${eventOrState}`);
    return false;
  }

  /**
   * Legacy listener API: on(stateName, callback).
   * Accepts both old ('IDLE', 'LOCKED') and new state names.
   */
  on(state: string, callback: (s: SpinState) => void): () => void {
    // Normalise to new name
    const newState = (LEGACY_STATE_MAP[state] ?? state) as GameplayLifecycleState;
    if (!this.legacyListeners.has(newState)) {
      this.legacyListeners.set(newState, new Set());
    }
    this.legacyListeners.get(newState)!.add(callback);
    return () => this.legacyListeners.get(newState)?.delete(callback);
  }

  canTransition(event: string): boolean {
    const target = LEGACY_EVENT_MAP[event] ?? event;
    return this.machine.canTransitionTo(target as GameplayLifecycleState);
  }

  isSpinning(): boolean { return this.machine.isSpinning(); }
  isRevealing(): boolean { return this.machine.isRevealing(); }
  isLocked(): boolean { return this.machine.isLocked(); }
  canSpin(): boolean { return this.machine.canSpin() || this.legacyState === 'IDLE' || this.legacyState === 'READY'; }

  reset(): void {
    this.legacyState = 'IDLE';
    // Notify any IDLE listeners
    this.legacyListeners.get('IDLE')?.forEach((fn) => fn('IDLE' as SpinState));
    this.legacyListeners.get('PLAYER_READY')?.forEach((fn) => fn('PLAYER_READY' as SpinState));
  }

  destroy(): void {
    this.machine.destroy();
    this.legacyListeners.clear();
  }
}
