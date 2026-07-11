"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { GameplayArena } from "@/components/gameplay/GameplayArena";
import { GameplayHUD } from "@/components/gameplay/hud";
import {
  PhantomNetworkIntro,
  type NetworkPlayer,
} from "@/components/gameplay/PhantomNetworkIntro";
import { HUDStudioProvider } from "@/components/gameplay/hud-studio";
import { useGameplayStore } from "@/stores/useGameplayStore";
import { useStealStore } from "@/stores/useStealStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRealtimeSession, usePhaseTimer } from "@/hooks/useRealtimeSession";
import { useLiveFeedUpdates } from "@/hooks/useLiveFeedUpdates";
import { useLeaderboardUpdates } from "@/hooks/useLeaderboardUpdates";
import { useEffectsUpdates } from "@/hooks/useEffectsUpdates";
import { useInventoryUpdates } from "@/hooks/useInventoryUpdates";
import { useServerTime } from "@/hooks/useServerTime";
import type { StealTarget } from "@/types/gameplay";
import { reportClientError } from "@/lib/monitoring/client-report";

interface SquadMemberRow {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface LeaderboardRow {
  user_id: string;
  session_tokens: number;
  profiles?: { username: string } | null;
}

interface GameplayStateResponse {
  player?: {
    user_id: string;
    session_tokens: number;
    is_eliminated: boolean;
    is_revivable: boolean;
  };
  phase?: number;
  phaseEndsAt?: number | null;
  round?: number;
  maxRoundsPerPhase?: number;
  playerRank?: number;
  totalPlayers?: number;
  squadMembers?: SquadMemberRow[];
  leaderboard?: LeaderboardRow[];
  networkPlayers?: NetworkPlayer[];
  sessionStatus?: string;
  totalPoolCents?: number;
}

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { subSessionId, setSubSessionId } = useSessionStore();
  const {
    phase,
    round,
    phaseEndsAt,
    tokens,
    isSpinning,
    spinLocked,
    lastOutcome,
    isEliminated,
    isRevivable,
    setPhase,
    setRound,
    setPhaseEndsAt,
    setTokens,
    setSpinning,
    setSpinLocked,
    setLastOutcome,
    setEliminated,
    setRevivable,
    resetGameplay,
  } = useGameplayStore();
  const {
    targets,
    stealInProgress,
    attackerId,
    fireBoostTaps,
    setTargets,
    setStealInProgress,
    incrementFireBoost,
    resetFireBoost,
  } = useStealStore();

  const [showStealPicker, setShowStealPicker] = useState(false);
  const [reviveTargetId, setReviveTargetId] = useState<string | null>(null);
  const [networkPlayers, setNetworkPlayers] = useState<NetworkPlayer[]>([]);
  const [squadMembers, setSquadMembers] = useState<SquadMemberRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [playerRank, setPlayerRank] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [maxRounds, setMaxRounds] = useState(3);
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [showNetworkIntro, setShowNetworkIntro] = useState(false);
  const [introPhase, setIntroPhase] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<string>("active");
  const [totalPoolCents, setTotalPoolCents] = useState<number | null>(null);

  const [ready, setReady] = useState(false);
  const lastIntroPhaseRef = useRef<number | null>(null);
  const pendingSpinData = useRef<{
    outcome: SpinOutcome;
    tokens: number;
    requiresTargetSelection: boolean;
  } | null>(null);

  // Hook calls at top level - all 5 custom hooks for real-time subscriptions
  useServerTime();
  useLiveFeedUpdates(subSessionId);
  useLeaderboardUpdates(subSessionId);
  useEffectsUpdates(currentUserId || null, subSessionId);
  useInventoryUpdates(currentUserId || null, subSessionId);

  useEffect(() => {
    resetGameplay();
    lastIntroPhaseRef.current = null;
  }, [sessionId, resetGameplay]);
  const remaining = usePhaseTimer(phaseEndsAt);

  const triggerNetworkIntro = useCallback((forPhase: number) => {
    setIntroPhase(forPhase);
    setShowNetworkIntro(true);
    lastIntroPhaseRef.current = forPhase;
  }, []);

  const applyState = useCallback(
    (data: GameplayStateResponse) => {
      if (data.player) {
        setCurrentUserId(data.player.user_id);
        setTokens(Number(data.player.session_tokens));
        setEliminated(data.player.is_eliminated);
        setRevivable(data.player.is_revivable);
      }
      if (data.phase !== undefined) setPhase(data.phase);
      if (data.round !== undefined) setRound(data.round);
      if (data.phaseEndsAt != null) setPhaseEndsAt(data.phaseEndsAt);
      if (data.playerRank != null) setPlayerRank(data.playerRank);
      if (data.totalPlayers != null) setTotalPlayers(data.totalPlayers);
      if (data.maxRoundsPerPhase) setMaxRounds(data.maxRoundsPerPhase);
      if (data.squadMembers) setSquadMembers(data.squadMembers);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      if (data.networkPlayers) setNetworkPlayers(data.networkPlayers);
      if (data.sessionStatus) setSessionStatus(data.sessionStatus);
      if (data.totalPoolCents !== undefined) setTotalPoolCents(data.totalPoolCents);
    },
    [setPhase, setRound, setPhaseEndsAt, setTokens, setEliminated, setRevivable]
  );

  const refreshState = useCallback(async () => {
    if (!subSessionId) return;
    try {
      const res = await fetch(`/api/gameplay/state?subSessionId=${subSessionId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as GameplayStateResponse;
      applyState(data);
      return data;
    } catch (err) {
      reportClientError({
        area: "gameplay",
        severity: "high",
        message: "Failed to refresh gameplay state",
        cause: err instanceof Error ? err.message : String(err),
        context: { sessionId, subSessionId },
      });
    }
  }, [subSessionId, applyState, sessionId]);

  const handlePhaseChange = useCallback(
    (payload: { phase: number; round?: number; phaseEndsAt?: number }) => {
      if (payload.phase && payload.phase !== lastIntroPhaseRef.current) {
        triggerNetworkIntro(payload.phase);
      }
    },
    [triggerNetworkIntro]
  );

  useRealtimeSession(subSessionId, handlePhaseChange, refreshState);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/my-sub-session`)
      .then((r) => r.json())
      .then((d) => {
        if (d.subSessionId) setSubSessionId(d.subSessionId);
      })
      .catch((err) => {
        reportClientError({
          area: "gameplay",
          severity: "high",
          message: "Failed to fetch sub-session",
          cause: err instanceof Error ? err.message : String(err),
          context: { sessionId },
        });
      });
  }, [sessionId, setSubSessionId]);

  useEffect(() => {
    if (!subSessionId) return;

    let cancelled = false;

    (async () => {
      const data = await refreshState();
      if (cancelled) return;

      const p = data?.phase ?? 1;
      if (lastIntroPhaseRef.current === null) {
        triggerNetworkIntro(p);
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [subSessionId, refreshState, triggerNetworkIntro]);

  useEffect(() => {
    if (!subSessionId || !ready) return;

    const pollMs = remaining <= 0 && phaseEndsAt ? 2000 : 5000;
    const id = setInterval(refreshState, pollMs);
    return () => clearInterval(id);
  }, [subSessionId, ready, remaining, phaseEndsAt, refreshState]);

  const handleSpin = useCallback(async () => {
    if (!subSessionId || spinLocked) return;
    setSpinning(true);
    setSpinLocked(true);

    const res = await fetch("/api/gameplay/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId }),
    });
    const data = await res.json();

    if (data.outcome) {
      pendingSpinData.current = data;
      setLastOutcome(data.outcome);
    }
  }, [subSessionId, spinLocked, setSpinning, setSpinLocked, setLastOutcome]);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    setTimeout(() => setSpinLocked(false), 500);

    // Hard sync client tokens with server's finalized state on animation resolve
    if (pendingSpinData.current && pendingSpinData.current.tokens !== undefined) {
      setTokens(pendingSpinData.current.tokens);
    }
    pendingSpinData.current = null;
  }, [setSpinning, setSpinLocked, setTokens]);

  const handleTokensAwarded = useCallback((amount: number) => {
    console.log('[PlayPage] Token particle arrived, incrementing client tokens by:', amount);
    setTokens((prev) => Math.round((prev + amount) * 10) / 10);
  }, [setTokens]);

  const handleStealActivated = useCallback(async () => {
    console.log('[PlayPage] Steal activated. Fetching targets...');
    if (!subSessionId) return;
    const targetsRes = await fetch("/api/gameplay/steal/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId }),
    });
    const targetsData = await targetsRes.json();
    setTargets(targetsData.targets ?? []);
    setShowStealPicker(true);
  }, [subSessionId, setTargets]);

  const handleStealSelect = async (target: StealTarget) => {
    await fetch("/api/gameplay/steal/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, victimId: target.userId }),
    });
    setShowStealPicker(false);
    refreshState();
  };

  const handleResolveSteal = async () => {
    await fetch("/api/gameplay/steal/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, resolve: true }),
    });
    resetFireBoost();
    setStealInProgress(false);
    refreshState();
  };

  const handleFireBoost = async () => {
    if (!attackerId) return;
    await fetch("/api/gameplay/steal/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, attackerId }),
    });
    incrementFireBoost();
  };

  if (sessionStatus === "completed") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-phantom-bg p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-phantom-gold">Session Complete</h2>
        <p className="text-phantom-muted">This session has concluded. Check your profile for results.</p>
      </div>
    );
  }

  if (!ready && !subSessionId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-phantom-bg">
        <p className="text-phantom-muted">Entering the Phantom Network...</p>
      </div>
    );
  }

  return (
    <>
      <PhantomNetworkIntro
        visible={showNetworkIntro}
        players={networkPlayers}
        phase={introPhase}
        onComplete={() => setShowNetworkIntro(false)}
      />

      {!showNetworkIntro && (
        <HUDStudioProvider>
          <GameplayHUD
            phase={phase || 1}
            totalPhases={6}
            prizePoolCents={totalPoolCents ?? undefined}
            tokens={tokens}
            playerRank={playerRank}
            alivePlayers={totalPlayers}
            surgePercent={72}
            isSpinning={isSpinning}
            spinLocked={spinLocked}
            lastOutcome={lastOutcome}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
            onTokensAwarded={handleTokensAwarded}
            onStealActivated={handleStealActivated}
          />
        </HUDStudioProvider>
      )}
    </>
  );
}
