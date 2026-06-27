"use client";

import { useEffect, useState } from "react";
import { useGameplayStore } from "@/stores/useGameplayStore";
import { useStealStore } from "@/stores/useStealStore";

interface PhaseChangePayload {
  phase: number;
  round?: number;
  phaseEndsAt?: number;
}

export function useRealtimeSession(
  subSessionId: string | null,
  onPhaseChange?: (payload: PhaseChangePayload) => void
) {
  const { setTokens, setPhase, setRound, setPhaseEndsAt, setLastOutcome, setEliminated } =
    useGameplayStore();
  const { setStealInProgress, incrementFireBoost, resetFireBoost } = useStealStore();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!subSessionId) return;

    const es = new EventSource(`/api/realtime/${subSessionId}`);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        switch (event.type) {
          case "tokens_update":
          case "spin_result":
            if (event.tokens !== undefined) setTokens(event.tokens);
            if (event.outcome !== undefined) setLastOutcome(event.outcome);
            break;
          case "round_update":
            if (event.round !== undefined) setRound(event.round);
            break;
          case "phase_change":
            setPhase(event.phase);
            if (event.round !== undefined) setRound(event.round);
            if (event.phaseEndsAt) setPhaseEndsAt(event.phaseEndsAt);
            onPhaseChange?.({
              phase: event.phase,
              round: event.round,
              phaseEndsAt: event.phaseEndsAt,
            });
            break;
          case "elimination":
            setEliminated(event.eliminated);
            break;
          case "steal_in_progress":
            setStealInProgress(true, event.attackerId);
            break;
          case "steal_boost":
            incrementFireBoost();
            break;
          case "steal_resolved":
            setStealInProgress(false);
            resetFireBoost();
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => es.close();
  }, [
    subSessionId,
    setTokens,
    setPhase,
    setRound,
    setPhaseEndsAt,
    setLastOutcome,
    setEliminated,
    setStealInProgress,
    incrementFireBoost,
    resetFireBoost,
    onPhaseChange,
  ]);

  return { connected };
}

export function usePhaseTimer(phaseEndsAt: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!phaseEndsAt) return;
    const tick = () => setRemaining(Math.max(0, phaseEndsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  return remaining;
}
