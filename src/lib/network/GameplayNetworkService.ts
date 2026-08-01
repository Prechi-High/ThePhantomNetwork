/**
 * Gameplay Network Service — spin, steal, revive, tactical, phase/state.
 */

import { apiFetch, apiFetchBackground } from "./client";
import type {
  GameplayStateResponse,
  PhaseAdvanceResponse,
  ReviveResponse,
  SpinResponse,
  StealExecuteResponse,
  StealTargetsResponse,
  TacticalActivateResponse,
} from "./types";
import type { NetworkError } from "./types";

export const gameplayNetwork = {
  async getState(subSessionId: string) {
    return apiFetch<GameplayStateResponse>(
      `/api/gameplay/state?subSessionId=${encodeURIComponent(subSessionId)}`
    );
  },

  async requestSpin(subSessionId: string) {
    return apiFetch<SpinResponse>("/api/gameplay/spin", {
      method: "POST",
      body: JSON.stringify({ subSessionId }),
    });
  },

  /** Non-blocking spin — animation continues while request runs */
  requestSpinBackground(
    subSessionId: string,
    handlers: {
      onSuccess: (data: SpinResponse) => void;
      onError: (error: NetworkError) => void;
    }
  ): void {
    apiFetchBackground<SpinResponse>(
      "/api/gameplay/spin",
      { method: "POST", body: JSON.stringify({ subSessionId }) },
      handlers
    );
  },

  async advancePhase(subSessionId: string) {
    return apiFetch<PhaseAdvanceResponse>("/api/gameplay/phase/advance", {
      method: "POST",
      body: JSON.stringify({ subSessionId }),
    });
  },

  async getStealTargets(subSessionId: string, options?: { victimId?: string; preview?: boolean }) {
    return apiFetch<StealTargetsResponse>("/api/gameplay/steal/targets", {
      method: "POST",
      body: JSON.stringify({ subSessionId, ...options }),
    });
  },

  async executeSteal(subSessionId: string, victimId: string, resolve = false) {
    return apiFetch<StealExecuteResponse>("/api/gameplay/steal/execute", {
      method: "POST",
      body: JSON.stringify({ subSessionId, victimId, resolve }),
    });
  },

  async boostSteal(subSessionId: string) {
    return apiFetch<StealExecuteResponse>("/api/gameplay/steal/boost", {
      method: "POST",
      body: JSON.stringify({ subSessionId }),
    });
  },

  async contributeRevive(subSessionId: string, targetUserId: string, amount: number) {
    return apiFetch<ReviveResponse>("/api/gameplay/revive/contribute", {
      method: "POST",
      body: JSON.stringify({ subSessionId, targetUserId, amount }),
    });
  },

  async activateTactical(
    subSessionId: string,
    sessionId: string,
    assetSlug: string,
    targetId?: string
  ) {
    return apiFetch<TacticalActivateResponse>("/api/gameplay/tactical/activate", {
      method: "POST",
      body: JSON.stringify({ subSessionId, sessionId, assetSlug, targetId }),
    });
  },

  activateTacticalBackground(
    subSessionId: string,
    sessionId: string,
    assetSlug: string,
    targetId: string | undefined,
    handlers: {
      onSuccess: (data: TacticalActivateResponse) => void;
      onError: (error: NetworkError) => void;
    }
  ): void {
    apiFetchBackground<TacticalActivateResponse>(
      "/api/gameplay/tactical/activate",
      {
        method: "POST",
        body: JSON.stringify({ subSessionId, sessionId, assetSlug, targetId }),
      },
      handlers
    );
  },
};
