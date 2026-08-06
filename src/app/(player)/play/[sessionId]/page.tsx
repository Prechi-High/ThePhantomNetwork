"use client";

/**
 * ============================================================================
 * PLAY PAGE — THE GAME DIRECTOR
 * ============================================================================
 *
 * This page is not a renderer. It is the gameplay bootstrapper.
 *
 * Responsibilities (NO gameplay logic):
 *   ① Session validation
 *   ② Runtime initialization (ordered)
 *   ③ Realtime subscription setup
 *   ④ Boot sequence + Network Intro
 *   ⑤ Server-authoritative action dispatchers
 *   ⑥ Clean shutdown on unmount
 *   ⑦ Error boundary delegation
 *
 * Boot order (enforced):
 *   Server time → Session → Stores → Hooks → HUD → Gameplay
 *
 * Everything visual lives in GameplayHUD.
 * Everything gameplay lives in the Runtime.
 * This page wires them together, nothing else.
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ── Gameplay systems ───────────────────────────────────────────────────────

import { GameplayHUD } from "@/components/gameplay/hud";
import { CinematicCountdown }    from "@/components/gameplay/CinematicCountdown";
import { PhaseSlideTransition } from "@/components/gameplay/PhaseSlideTransition";

// ── Stores (via public module boundary) ───────────────────────────────────

import { useGameplayStore }  from "@/stores/useGameplayStore";
import { useSessionStore }   from "@/stores/useSessionStore";
import { useStealStore }     from "@/stores/useStealStore";

// ── Synchronization hooks ──────────────────────────────────────────────────

import { useRealtimeSession, usePhaseTimer } from "@/hooks/useRealtimeSession";
import { useServerTime }         from "@/hooks/useServerTime";
import { useLeaderboardUpdates } from "@/hooks/useLeaderboardUpdates";
import { useSurgePercent } from "@/hooks/useSurgePercent";
import { reportClientError }     from "@/lib/monitoring/client-report";
import { initGameplaySystems }   from "@/lib/gameplay/bootstrap";
import {
  requestSpin,
  completeSpinCycle,
  executeStealFlow,
  requestStealTargets,
  refreshGameplayState,
  resolveSteal,
  fireStealBoost,
  contributeRevive,
} from "@/lib/gameplay/actions";
import { sessionNetwork } from "@/lib/network";
import type { GameplayStateResponse } from "@/lib/network/types";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { interactionController } from "@/lib/motion/InteractionController";

// ── Gameplay lifecycle ─────────────────────────────────────────────────────

type GameplayLifecycle =
  | "created"
  | "connecting"
  | "synchronizing"
  | "booting"
  | "ready"
  | "active"
  | "paused"
  | "recovering"
  | "finishing"
  | "results"
  | "cleanup";

import type { StealTarget } from "@/types/gameplay";

// ══════════════════════════════════════════════════════════════════════════════
// GAME DIRECTOR
// ══════════════════════════════════════════════════════════════════════════════

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  // ── Lifecycle state ──────────────────────────────────────────────────────
  const [lifecycle, setLifecycle] = useState<GameplayLifecycle>("created");
  const [sessionStatus, setSessionStatus] = useState<string>("active");
  const [subSessionStatus, setSubSessionStatus] = useState<string>("active");

  // ── UI state (only what page.tsx must own) ───────────────────────────────
  const [currentUserId, setCurrentUserId]   = useState<string>();
  const [mySquadId, setMySquadId]           = useState<string | null>(null);
  const [totalPoolCents, setTotalPoolCents] = useState<number | null>(null);
  const [playerRank, setPlayerRank]         = useState(0);
  const [totalPlayers, setTotalPlayers]     = useState(0);
  const [topPlayers, setTopPlayers]         = useState<Array<{ rank: number; username: string; tokens: number; userId?: string }>>([]);
  const [totalPhases, setTotalPhases]       = useState(6);
  const [phaseStartedAt, setPhaseStartedAt] = useState<number | null>(null);
  const [squadMembers, setSquadMembers]     = useState<GameplayStateResponse["squadMembers"]>([]);

  // ── Intro ────────────────────────────────────────────────────────────────
  const [showCinematicCountdown, setShowCinematicCountdown] = useState(false);
  const [sessionMode, setSessionMode] = useState<"squad" | "solo">("squad");
  const lastKnownPhaseRef = useRef<number>(1);

  useEffect(() => {
    interactionController.setScreen("play");
    for (const cue of ["arena_hum", "wheel_idle_hum", "home_wind", "banner_cloth", "home_crackle"] as const) {
      interactionController.stopSound(cue, 0);
    }
  }, []);
  const phaseTimerAnchorRef = useRef<{ phase: number; endsAt: number } | null>(null);

  // ── Store slices (minimal) ───────────────────────────────────────────────
  const {
    phase, phaseEndsAt, tokens,
    isSpinning, spinLocked, lastOutcome, pendingTokenDelta,
    setPhase, setRound, setPhaseEndsAt,
    setTokens, setEliminated, setRevivable,
    resetGameplay,
  } = useGameplayStore();

  const { subSessionId, setSubSessionId } = useSessionStore();

  const {
    targets, stealInProgress, attackerId, fireBoostTaps,
    setTargets, setStealInProgress, incrementFireBoost, resetFireBoost,
  } = useStealStore();

  const [showStealPicker, setShowStealPicker] = useState(false);
  const [stealTargetError, setStealTargetError] = useState<string | null>(null);
  const [reviveTargetId, setReviveTargetId]   = useState<string | null>(null);

  const surgePercent = useSurgePercent(phaseEndsAt, phaseStartedAt);

  const rankingPercentile = useMemo(() => {
    if (!playerRank || !totalPlayers) return 0;
    return Math.max(1, Math.round(((totalPlayers - playerRank + 1) / totalPlayers) * 100));
  }, [playerRank, totalPlayers]);

  // ── ① SERVER TIME — must init first ─────────────────────────────────────
  useServerTime();   // establishes clock offset; used by effects/inventory hooks

  // ── ② REALTIME SUBSCRIPTIONS ────────────────────────────────────────────
  useLeaderboardUpdates(subSessionId, mySquadId);

  // ── ③ APPLY SERVER STATE → STORES ───────────────────────────────────────
  const applyState = useCallback((data: GameplayStateResponse & {
    totalPoolCents?: number;
    topPlayers?: Array<{ rank: number; username: string; tokens: number; userId?: string }>;
    totalPhases?: number;
    phaseStartedAt?: number | null;
    squadMembers?: GameplayStateResponse["squadMembers"];
  }) => {
    if (data.player) {
      setCurrentUserId(data.player.user_id);
      const playerSquadId = (data.player as { squad_id?: string | null }).squad_id;
      if (playerSquadId !== undefined) setMySquadId(playerSquadId);
      const spinning = useGameplayStore.getState().isSpinning;
      if (!spinning) {
        setTokens(Number(data.player.session_tokens));
      }
      setEliminated(data.player.is_eliminated);
      setRevivable(data.player.is_revivable);
    }
    if (data.phase != null && data.phase >= lastKnownPhaseRef.current) {
      const phaseAdvanced = data.phase > lastKnownPhaseRef.current;
      lastKnownPhaseRef.current = data.phase;
      setPhase(data.phase);

      if (data.phaseEndsAt != null) {
        const anchor = phaseTimerAnchorRef.current;
        if (phaseAdvanced || !anchor || anchor.phase !== data.phase) {
          setPhaseEndsAt(data.phaseEndsAt);
          phaseTimerAnchorRef.current = { phase: data.phase, endsAt: data.phaseEndsAt };
          if (data.phaseStartedAt != null) setPhaseStartedAt(data.phaseStartedAt);
        }
      } else if (phaseAdvanced && data.phaseStartedAt != null) {
        setPhaseStartedAt(data.phaseStartedAt);
      }
    }
    if (data.round       != null) setRound(data.round);
    if (data.playerRank  != null) setPlayerRank(data.playerRank);
    if (data.totalPlayers!= null) setTotalPlayers(data.totalPlayers);
    if (data.sessionStatus)       setSessionStatus(data.sessionStatus);
    if (data.subSessionStatus)    setSubSessionStatus(data.subSessionStatus);
    else if (data.subSession?.status) setSubSessionStatus(data.subSession.status);
    if (data.totalPoolCents != null) setTotalPoolCents(data.totalPoolCents);
    if (data.topPlayers) setTopPlayers(data.topPlayers);
    if (data.totalPhases != null) setTotalPhases(data.totalPhases);
    if (data.squadMembers) setSquadMembers(data.squadMembers);
  }, [setPhase, setRound, setPhaseEndsAt, setTokens, setEliminated, setRevivable]);

  // ── ④ REFRESH STATE FROM SERVER ─────────────────────────────────────────
  const refreshState = useCallback(async () => {
    if (!subSessionId) return;
    try {
      const data = await refreshGameplayState(subSessionId);
      if (data) applyState(data as GameplayStateResponse & {
        totalPoolCents?: number;
        topPlayers?: Array<{ rank: number; username: string; tokens: number; userId?: string }>;
        totalPhases?: number;
        phaseStartedAt?: number | null;
      });
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

  // ── ⑤ REALTIME SESSION — phase change / combat events ───────────────────
  const handlePhaseChange = useCallback(
    (payload: { phase: number; round?: number; phaseEndsAt?: number }) => {
      if (payload.phase && payload.phase > lastKnownPhaseRef.current) {
        lastKnownPhaseRef.current = payload.phase;
        if (payload.phaseEndsAt) {
          phaseTimerAnchorRef.current = {
            phase: payload.phase,
            endsAt: payload.phaseEndsAt,
          };
        }
      }
    },
    []
  );

  const handleSessionComplete = useCallback(() => {
    setSubSessionStatus("completed");
    setSessionStatus("completed");
  }, []);

  useRealtimeSession(subSessionId, handlePhaseChange, refreshState, handleSessionComplete, currentUserId);

  const isSessionComplete =
    sessionStatus === "completed" || subSessionStatus === "completed";

  useEffect(() => {
    if (isSessionComplete) {
      router.replace(`/sessions/${sessionId}/results`);
    }
  }, [isSessionComplete, sessionId, router]);

  // ── ⑥ BOOT SEQUENCE ─────────────────────────────────────────────────────

  // Step A: fetch sub-session ID from session
  useEffect(() => {
    setLifecycle("connecting");
    sessionNetwork.getSession(sessionId)
      .then((result) => {
        if (result.ok) {
          const d = result.data as { session?: { session_mode?: string } };
          if (d.session?.session_mode) setSessionMode(d.session.session_mode as "squad" | "solo");
        }
      })
      .catch(() => {});
    sessionNetwork.getMySubSession(sessionId)
      .then((result) => {
        if (result.ok && result.data.subSessionId) {
          setSubSessionId(result.data.subSessionId);
          setLifecycle("synchronizing");
        }
      })
      .catch((err) => {
        reportClientError({
          area: "gameplay",
          severity: "high",
          message: "Failed to fetch sub-session",
          cause: err instanceof Error ? err.message : String(err),
          context: { sessionId },
        });
        setLifecycle("recovering");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Step B: once sub-session exists, load initial state → show intro → go active
  useEffect(() => {
    if (!subSessionId || lifecycle === "active") return;

    let cancelled = false;

    const boot = async () => {
      setLifecycle("booting");
      resetGameplay();
      lastKnownPhaseRef.current = 1;
      phaseTimerAnchorRef.current = null;

      const data = await refreshState();
      if (cancelled) return;

      const bootPhase = data?.phase ?? 1;
      lastKnownPhaseRef.current = bootPhase;
      if (data?.phaseEndsAt != null) {
        phaseTimerAnchorRef.current = { phase: bootPhase, endsAt: data.phaseEndsAt };
      }
      setShowCinematicCountdown(true);
      initGameplaySystems(sessionId, subSessionId);
      setLifecycle("ready");
    };

    boot();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subSessionId]);

  const handleCinematicCountdownComplete = useCallback(() => {
    setShowCinematicCountdown(false);
    setLifecycle("active");
  }, []);

  const phaseRemaining = usePhaseTimer(phaseEndsAt);
  const phaseExpired = phaseEndsAt != null && phaseRemaining <= 0;
  const gameplayLocked = phaseExpired || isSessionComplete;

  // Phase transitions are server/cron authoritative — client reacts via realtime + polling only.

  // ── ⑦ ADAPTIVE POLLING (urgent near phase end) ──────────────────────────
  useEffect(() => {
    if (!subSessionId || lifecycle !== "active") return;
    const pollMs = isSessionComplete
      ? 1_000
      : phaseExpired
        ? 1_000
        : 5_000;
    const id = setInterval(refreshState, pollMs);
    return () => clearInterval(id);
  }, [subSessionId, lifecycle, phaseEndsAt, phaseExpired, isSessionComplete, refreshState]);

  // ── ⑧ CLEANUP on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      resetGameplay();
      setLifecycle("cleanup");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ⑨ SERVER-AUTHORITATIVE ACTION DISPATCHERS ───────────────────────────
  // These are the only places that talk to the API.
  // They dispatch, then let the server response and realtime drive state.

  const handleSpin = useCallback(() => {
    if (!subSessionId || spinLocked || lifecycle !== "active" || gameplayLocked) return;
    void requestSpin();
  }, [subSessionId, spinLocked, lifecycle, gameplayLocked]);

  const handleSpinComplete = useCallback(() => {
    const serverTokens = useGameplayStore.getState().pendingServerTokens;
    completeSpinCycle(serverTokens ?? undefined);
  }, []);

  const handleTokensAwarded = useCallback((_amount: number) => {
    // Display counter animates in GameplayHUD; store syncs in handleSpinComplete
  }, []);

  const handleStealActivated = useCallback(() => {
    if (!subSessionId) return;
    requestStealTargets(subSessionId);
    setShowStealPicker(true);
  }, [subSessionId]);

  const handleStealSelect = useCallback((target: StealTarget) => {
    if (!subSessionId) return;
    executeStealFlow(subSessionId, target, () => {
      setShowStealPicker(false);
      setStealTargetError(null);
      refreshState();
    });
  }, [subSessionId, refreshState]);

  const handleStealCancel = useCallback(() => {
    setShowStealPicker(false);
    setStealTargetError(null);
  }, []);

  const handleResolveSteal = useCallback(() => {
    if (!subSessionId) return;
    resolveSteal(subSessionId, () => refreshState());
  }, [subSessionId, refreshState]);

  const handleFireBoost = useCallback(() => {
    if (!attackerId || !subSessionId) return;
    fireStealBoost(subSessionId, attackerId);
  }, [subSessionId, attackerId]);

  const handleReviveContribute = useCallback((amount: number) => {
    if (!reviveTargetId || !subSessionId) return;
    contributeRevive(subSessionId, reviveTargetId, amount, () => refreshState());
  }, [subSessionId, reviveTargetId, refreshState]);

  // ── ⑩ SESSION COMPLETE SCREEN ────────────────────────────────────────────
  if (isSessionComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-phantom-bg p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-phantom-gold">Legacy Forged</h2>
        <p className="text-phantom-muted">Loading your legacy record…</p>
      </div>
    );
  }

  // ── ⑪ CONNECTING / BOOT SCREEN ───────────────────────────────────────────
  if (lifecycle === "created" || lifecycle === "connecting" || lifecycle === "booting") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#04020a]">
        <div
          className="w-6 h-6 rounded-full border-2 border-purple-500/30 border-t-purple-400"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p className="text-[11px] font-bold tracking-widest uppercase text-purple-400/60">
          {lifecycle === "connecting" ? "Connecting..." : "Entering LEGACIES..."}
        </p>
      </div>
    );
  }

  // ── ⑫ RECOVERING ─────────────────────────────────────────────────────────
  if (lifecycle === "recovering") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#04020a]">
        <p className="text-[11px] font-bold tracking-widest uppercase text-amber-400/70">
          Synchronizing...
        </p>
        <p className="text-[9px] text-purple-400/40 tracking-wider">Restoring session state</p>
      </div>
    );
  }

  // ── ⑬ MAIN RENDER ────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Cinematic countdown (session start) ── */}
      {showCinematicCountdown && (
        <CinematicCountdown onComplete={handleCinematicCountdownComplete} />
      )}

      {/* ── Gameplay HUD with TikTok-style phase slide ── */}
      {!showCinematicCountdown && (
        <PhaseSlideTransition phase={phase || 1}>
          <GameplayHUD
            sessionId={sessionId}
            soloMode={sessionMode === "solo"}
            topPlayers={topPlayers}
            squadMembers={squadMembers}
            currentUserId={currentUserId}
            phase={phase || 1}
            totalPhases={totalPhases}
            prizePoolCents={totalPoolCents ?? undefined}
            phaseEndsAt={phaseEndsAt}
            tokens={tokens}
            playerRank={playerRank}
            alivePlayers={totalPlayers}
            rankingPercentile={rankingPercentile}
            isSpinning={isSpinning}
            spinLocked={spinLocked || gameplayLocked}
            lastOutcome={lastOutcome}
            tokenAmount={pendingTokenDelta}
            surgePercent={surgePercent}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
            onTokensAwarded={handleTokensAwarded}
            onStealActivated={handleStealActivated}
          />
        </PhaseSlideTransition>
      )}

      {showStealPicker && !showCinematicCountdown && (
        <StealTargetPicker
          targets={targets}
          emptyMessage={stealTargetError ?? undefined}
          onSelect={handleStealSelect}
          onCancel={handleStealCancel}
        />
      )}
    </>
  );
}
