/**
 * Runtime ↔ Store bridge — single direction: gameplayEvents → useGameplayStore.
 * Pages and components should not mutate gameplay store directly for engine events.
 */

import { gameplayEvents, type GameplayEvent, type OutcomeReceivedPayload } from "./events";
import { useGameplayStore } from "@/stores/useGameplayStore";
import type { SpinOutcome } from "@/types/gameplay";
import type { GameplayLifecycleState } from "@/lib/spin/stateMachine";

let bridgeInitialized = false;
const unsubscribers: Array<() => void> = [];

function mapRuntimeStateToLifecycle(toState: string): GameplayLifecycleState | null {
  const map: Record<string, GameplayLifecycleState> = {
    SESSION_LOADING: "SESSION_LOADING",
    READY: "PLAYER_READY",
    BUTTON_PRESS: "SPIN_START",
    SPIN_ACCELERATION: "SPIN_ACCELERATION",
    SPIN_HIGH_SPEED: "SPIN_HIGH_SPEED",
    SPIN_DECELERATION: "SPIN_DECELERATION",
    POINTER_LOCK: "POINTER_ENGAGEMENT",
    OUTCOME_REVEAL: "REVEAL",
    TOKEN_COLLECTION: "TOKEN_COLLECTION",
    READY_FOR_NEXT_SPIN: "NEXT_SPIN_READY",
  };
  return map[toState] ?? null;
}

function handleEvent(event: GameplayEvent): void {
  const store = useGameplayStore.getState();

  switch (event.type) {
    case "SPIN_REQUESTED":
      store.requestSpin();
      store.logEvent("SPIN_REQUESTED");
      break;

    case "SPIN_STARTED":
      store.setSpinning(true);
      store.logEvent("SPIN_STARTED");
      break;

    case "OUTCOME_RECEIVED": {
      const payload = event.payload as OutcomeReceivedPayload;
      store.setPendingServerTokens(payload.newTokenTotal);
      store.startReveal(payload.outcome as SpinOutcome, payload.tokenDelta);
      store.logEvent("OUTCOME_RECEIVED");
      break;
    }

    case "REVEAL_COMPLETED":
    case "TOKEN_COLLECTION_COMPLETED":
      store.finishReveal();
      store.logEvent(event.type);
      break;

    case "READY_FOR_NEXT_SPIN":
      store.setSpinLocked(false);
      store.logEvent("READY_FOR_NEXT_SPIN");
      break;

    case "SPIN_VALIDATION_FAILED":
      store.setSpinning(false);
      store.setSpinLocked(false);
      store.logEvent("SPIN_VALIDATION_FAILED");
      break;

    case "PHASE_STARTED": {
      const payload = event.payload as { phase: number; round: number; phaseEndsAt: number };
      store.setPhase(payload.phase);
      store.setRound(payload.round);
      store.setPhaseEndsAt(payload.phaseEndsAt);
      store.logEvent("PHASE_STARTED");
      break;
    }

    case "STATE_TRANSITION": {
      const payload = event.payload as { toState: string };
      const lifecycle = mapRuntimeStateToLifecycle(payload.toState);
      if (lifecycle) store.enterState(lifecycle);
      store.logEvent(`STATE:${payload.toState}`);
      break;
    }

    default:
      break;
  }
}

/** Wire gameplay event bus to Zustand store (call once on play page mount) */
export function initGameplayStoreBridge(): () => void {
  if (bridgeInitialized) {
    return () => {};
  }
  bridgeInitialized = true;

  const unsubAll = gameplayEvents.onAll(handleEvent);
  unsubscribers.push(unsubAll);

  return () => {
    unsubAll();
    bridgeInitialized = false;
    unsubscribers.length = 0;
  };
}

/** Reset bridge for tests */
export function resetGameplayStoreBridge(): void {
  unsubscribers.forEach((u) => u());
  unsubscribers.length = 0;
  bridgeInitialized = false;
}
