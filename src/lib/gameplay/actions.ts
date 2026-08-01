/**
 * Gameplay actions — steal, revive, tactical, phase (Gameplay + Network engines).
 */

import { gameplayNetwork } from "@/lib/network";
import { gameplayEvents } from "./events";
import { gameplayRuntime } from "./runtime";
import { useStealStore } from "@/stores/useStealStore";
import { useGameplayStore } from "@/stores/useGameplayStore";
import { reportClientError } from "@/lib/monitoring/client-report";
import type { StealTarget } from "@/types/gameplay";
import type { TacticalAssetSlug } from "@/types/gameplay";
import { useEffectsStore, type ActiveEffect } from "@/stores/useEffectsStore";
import type { StealTargetsResponse } from "@/lib/network/types";

function mapStealTargets(raw: StealTargetsResponse["targets"]): StealTarget[] {
  return (raw ?? []).map((t) => ({
    userId: t.user_id,
    username: t.username,
    tokens: t.tokens,
    reason: t.isRival ? "Rival" : "Target",
    risk: t.risk,
    isRival: t.isRival,
    streak: t.streak,
  }));
}

export async function refreshGameplayState(subSessionId: string) {
  const result = await gameplayNetwork.getState(subSessionId);
  if (!result.ok) return null;
  return result.data;
}

export async function advancePhaseBackground(subSessionId: string): Promise<boolean> {
  const result = await gameplayNetwork.advancePhase(subSessionId);
  return result.ok && !!result.data.advanced;
}

export function requestStealTargets(subSessionId: string): void {
  useStealStore.getState().setStealInProgress(true);
  gameplayNetwork.getStealTargets(subSessionId).then((result) => {
    if (result.ok) {
      const targets = mapStealTargets(result.data.targets);
      useStealStore.getState().setTargets(targets);
      gameplayEvents.emit({
        type: "STEAL_ACTIVATED",
        timestamp: Date.now(),
        source: "runtime",
        payload: { targets },
      });
    } else {
      useStealStore.getState().setStealInProgress(false);
    }
  });
}

export function executeStealFlow(
  subSessionId: string,
  target: StealTarget,
  onComplete?: () => void
): void {
  useStealStore.getState().setStealInProgress(true);
  void (async () => {
    try {
      await gameplayNetwork.executeSteal(subSessionId, target.userId, false);
      await gameplayNetwork.executeSteal(subSessionId, target.userId, true);
      gameplayEvents.emit({
        type: "STEAL_RESOLVED",
        timestamp: Date.now(),
        source: "server",
        payload: { targetId: target.userId },
      });
    } catch (err) {
      reportClientError({
        area: "gameplay",
        severity: "high",
        message: "Steal execute failed",
        cause: err instanceof Error ? err.message : String(err),
        context: { subSessionId },
      });
    } finally {
      useStealStore.getState().resetFireBoost();
      useStealStore.getState().setStealInProgress(false);
      onComplete?.();
    }
  })();
}

export function resolveSteal(subSessionId: string, onComplete?: () => void): void {
  void gameplayNetwork
    .executeSteal(subSessionId, "", true)
    .finally(() => {
      useStealStore.getState().resetFireBoost();
      useStealStore.getState().setStealInProgress(false);
      onComplete?.();
    });
}

export function fireStealBoost(subSessionId: string, attackerId: string): void {
  useStealStore.getState().incrementFireBoost();
  void gameplayNetwork.boostSteal(subSessionId);
}

export function contributeRevive(
  subSessionId: string,
  targetId: string,
  amount: number,
  onComplete?: () => void
): void {
  void gameplayNetwork
    .contributeRevive(subSessionId, targetId, amount)
    .finally(() => onComplete?.());
}

export function activateTacticalAsset(
  subSessionId: string,
  sessionId: string,
  assetSlug: TacticalAssetSlug,
  targetId?: string
): void {
  useGameplayStore.getState().logEvent(`TACTICAL:${assetSlug}`);
  gameplayNetwork.activateTacticalBackground(
    subSessionId,
    sessionId,
    assetSlug,
    targetId,
    {
      onSuccess: (data) => {
        const effect = (data as { effect?: ActiveEffect }).effect;
        if (effect?.id) {
          useEffectsStore.getState().addEffect(effect);
        }
      },
      onError: (error) => {
        reportClientError({
          area: "gameplay",
          severity: "medium",
          message: "Tactical activation failed",
          cause: error.message,
          context: { subSessionId, assetSlug },
        });
      },
    }
  );
}

export function loadTacticalTargets(
  subSessionId: string,
  onLoaded: (targets: StealTarget[]) => void
): void {
  void gameplayNetwork.getStealTargets(subSessionId).then((result) => {
    if (result.ok) onLoaded(mapStealTargets(result.data.targets));
    else onLoaded([]);
  });
}

export async function requestSpin(): Promise<boolean> {
  return gameplayRuntime.requestSpin();
}

export function completeSpinCycle(serverTokens?: number): void {
  if (serverTokens !== undefined) {
    useGameplayStore.getState().setTokens(serverTokens);
  }
  useGameplayStore.getState().setSpinning(false);
  useGameplayStore.getState().setLastOutcome(null);
  useGameplayStore.getState().setPendingServerTokens(null);
  setTimeout(() => {
    useGameplayStore.getState().setSpinLocked(false);
    gameplayRuntime.forceReady();
  }, 250);
  gameplayEvents.emit({
    type: "READY_FOR_NEXT_SPIN",
    timestamp: Date.now(),
    source: "runtime",
  });
}
