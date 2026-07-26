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
import { reportClientError }     from "@/lib/monitoring/client-report";

// ── Types ──────────────────────────────────────────────────────────────────

import type { StealTarget, SpinOutcome } from "@/types/gameplay";
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

// ── Server state shape ─────────────────────────────────────────────────────

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
  squadMembers?: Array<{
    user_id: string;
    session_tokens: number;
    is_eliminated: boolean;
    is_revivable?: boolean;
    profiles?: { username: string } | null;
  }>;
  leaderboard?: Array<{
    user_id: string;
    session_tokens: number;
    profiles?: { username: string } | null;
  }>;
  sessionStatus?: string;
  subSessionStatus?: string;
  subSession?: { status?: string };
  totalPoolCents?: number;
  topPlayers?: Array<{ rank: number; username: string; tokens: number; userId?: string }>;
  totalPhases?: number;
  phaseStartedAt?: number | null;
}

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
    interactionController.startArenaAmbience();
  }, []);
  const lastAdvanceAttemptRef = useRef<number | null>(null);
  const advanceInFlightRef = useRef(false);
  const phaseTimerAnchorRef = useRef<{ phase: number; endsAt: number } | null>(null);

  // ── Pending spin data (server result awaiting animation) ────────────────
  const pendingSpinRef = useRef<{
    outcome: SpinOutcome;
    tokens: number;
    tokenDelta: number;
    requiresTargetSelection: boolean;
  } | null>(null);

  // ── Token delta from last spin (for animation) ───────────────────────────
  const [spinTokenAmount, setSpinTokenAmount] = useState(0);

  // ── Store slices (minimal) ───────────────────────────────────────────────
  const {
    phase, phaseEndsAt, tokens,
    isSpinning, spinLocked, lastOutcome,
    setPhase, setRound, setPhaseEndsAt,
    setTokens, setSpinning, setSpinLocked,
    setLastOutcome, setEliminated, setRevivable,
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

  // Tick once per second so surgePercent updates without 250ms re-renders
  const [surgeTick, setSurgeTick] = useState(0);
  useEffect(() => {
    if (!phaseEndsAt) return;
    const id = setInterval(() => setSurgeTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  const surgePercent = useMemo(() => {
    if (!phaseEndsAt || !phaseStartedAt) return 0;
    const total = phaseEndsAt - phaseStartedAt;
    if (total <= 0) return 0;
    const elapsed = Date.now() - phaseStartedAt;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }, [phaseEndsAt, phaseStartedAt, surgeTick]);

  const rankingPercentile = useMemo(() => {
    if (!playerRank || !totalPlayers) return 0;
    return Math.max(1, Math.round(((totalPlayers - playerRank + 1) / totalPlayers) * 100));
  }, [playerRank, totalPlayers]);

  // ── ① SERVER TIME — must init first ─────────────────────────────────────
  useServerTime();   // establishes clock offset; used by effects/inventory hooks

  // ── ② REALTIME SUBSCRIPTIONS ────────────────────────────────────────────
  useLeaderboardUpdates(subSessionId);

  // ── ③ APPLY SERVER STATE → STORES ───────────────────────────────────────
  const applyState = useCallback((data: GameplayStateResponse) => {
    if (data.player) {
      setCurrentUserId(data.player.user_id);
      setTokens(Number(data.player.session_tokens));
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
      const res = await fetch(`/api/gameplay/state?subSessionId=${subSessionId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as GameplayStateResponse;
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

  useRealtimeSession(subSessionId, handlePhaseChange, refreshState, handleSessionComplete);

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
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session?.session_mode) setSessionMode(d.session.session_mode);
      })
      .catch(() => {});
    fetch(`/api/sessions/${sessionId}/my-sub-session`)
      .then((r) => r.json())
      .then((d) => {
        if (d.subSessionId) {
          setSubSessionId(d.subSessionId);
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
      lastAdvanceAttemptRef.current = null;
      phaseTimerAnchorRef.current = null;

      const data = await refreshState();
      if (cancelled) return;

      const bootPhase = data?.phase ?? 1;
      lastKnownPhaseRef.current = bootPhase;
      if (data?.phaseEndsAt != null) {
        phaseTimerAnchorRef.current = { phase: bootPhase, endsAt: data.phaseEndsAt };
      }
      setShowCinematicCountdown(true);

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

  useEffect(() => {
    if (lifecycle !== "active" || !subSessionId || !phaseEndsAt) return;
    if (isSessionComplete) return;
    if (phaseRemaining > 0) return;
    if (advanceInFlightRef.current) return;
    if (lastAdvanceAttemptRef.current === phase) return;

    const advancePhase = async () => {
      advanceInFlightRef.current = true;
      try {
        const res = await fetch("/api/gameplay/phase/advance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subSessionId }),
        });
        const data = await res.json();

        if (data.done || data.reason === "already_completed") {
          setSubSessionStatus(data.subSessionStatus ?? "completed");
          if (data.sessionStatus) setSessionStatus(data.sessionStatus);
          lastAdvanceAttemptRef.current = phase ?? 1;
          return;
        }

        if (data.advanced && data.phase != null && data.phase >= lastKnownPhaseRef.current) {
          lastKnownPhaseRef.current = data.phase;
          setPhase(data.phase);
          if (data.phaseEndsAt != null) {
            setPhaseEndsAt(data.phaseEndsAt);
            phaseTimerAnchorRef.current = { phase: data.phase, endsAt: data.phaseEndsAt };
          }
          lastAdvanceAttemptRef.current = phase ?? 1;
        } else if (data.reason !== "advance_in_progress") {
          lastAdvanceAttemptRef.current = null;
        }
      } catch (err) {
        lastAdvanceAttemptRef.current = null;
        reportClientError({
          area: "gameplay",
          severity: "high",
          message: "Failed to advance phase",
          cause: err instanceof Error ? err.message : String(err),
          context: { sessionId, subSessionId, phase },
        });
      } finally {
        advanceInFlightRef.current = false;
        refreshState();
      }
    };

    advancePhase();
  }, [lifecycle, subSessionId, phaseEndsAt, phaseRemaining, phase, refreshState, sessionId, isSessionComplete]);

  // Reset advance guard when phase increments
  useEffect(() => {
    if (phase != null && lastAdvanceAttemptRef.current != null && phase > lastAdvanceAttemptRef.current) {
      lastAdvanceAttemptRef.current = null;
    }
  }, [phase]);

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

  const handleSpin = useCallback(async () => {
    if (!subSessionId || spinLocked || lifecycle !== "active" || gameplayLocked) return;
    setSpinning(true);
    setSpinLocked(true);

    try {
      const res = await fetch("/api/gameplay/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId }),
      });
      const data = await res.json();
      if (data.outcome) {
        // Compute tokenDelta from outcome so animation knows how many tokens to show
        const tokenDelta = data.tokenDelta ??
          (data.outcome === "ADVANCE" ? 3 :
           data.outcome === "ACQUIRE" ? 1 :
           data.outcome === "DISCOVER" ? 0.5 : 0);
        pendingSpinRef.current = { ...data, tokenDelta };
        setSpinTokenAmount(tokenDelta);
        setLastOutcome(data.outcome);
      } else {
        // Server rejected — unlock
        setSpinning(false);
        setSpinLocked(false);
      }
    } catch (err) {
      setSpinning(false);
      setSpinLocked(false);
      reportClientError({
        area: "gameplay",
        severity: "high",
        message: "Spin request failed",
        cause: err instanceof Error ? err.message : String(err),
        context: { subSessionId },
      });
    }
  }, [subSessionId, spinLocked, lifecycle, gameplayLocked, setSpinning, setSpinLocked, setLastOutcome]);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    setTimeout(() => setSpinLocked(false), 250);
    // Hard-sync tokens from server after animation resolves
    if (pendingSpinRef.current?.tokens !== undefined) {
      setTokens(pendingSpinRef.current.tokens);
    }
    pendingSpinRef.current = null;
    setSpinTokenAmount(0);
  }, [setSpinning, setSpinLocked, setTokens]);

  const handleTokensAwarded = useCallback((_amount: number) => {
    // Display counter animates in GameplayHUD; store syncs in handleSpinComplete
  }, []);

  const handleStealActivated = useCallback(async () => {
    if (!subSessionId) return;
    try {
      const res = await fetch("/api/gameplay/steal/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId }),
      });
      const data = await res.json();
      const nextTargets = data.targets ?? [];
      setTargets(nextTargets);
      setStealTargetError(
        nextTargets.length === 0 ? "No steal targets available right now." : null
      );
      setShowStealPicker(true);
    } catch {
      setStealTargetError("Could not load steal targets. Try again.");
      setShowStealPicker(true);
    }
  }, [subSessionId, setTargets]);

  const handleStealSelect = useCallback(async (target: StealTarget) => {
    if (!subSessionId) return;
    try {
      await fetch("/api/gameplay/steal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, victimId: target.userId }),
      });
      await fetch("/api/gameplay/steal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, resolve: true }),
      });
    } finally {
      setShowStealPicker(false);
      setStealTargetError(null);
      resetFireBoost();
      setStealInProgress(false);
      refreshState();
    }
  }, [subSessionId, refreshState, resetFireBoost, setStealInProgress]);

  const handleStealCancel = useCallback(() => {
    setShowStealPicker(false);
    setStealTargetError(null);
  }, []);

  const handleResolveSteal = useCallback(async () => {
    try {
      await fetch("/api/gameplay/steal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, resolve: true }),
      });
    } finally {
      resetFireBoost();
      setStealInProgress(false);
      refreshState();
    }
  }, [subSessionId, resetFireBoost, setStealInProgress, refreshState]);

  const handleFireBoost = useCallback(async () => {
    if (!attackerId) return;
    try {
      await fetch("/api/gameplay/steal/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, attackerId }),
      });
    } finally {
      incrementFireBoost();
    }
  }, [subSessionId, attackerId, incrementFireBoost]);

  const handleReviveContribute = useCallback(async (amount: number) => {
    if (!reviveTargetId) return;
    try {
      await fetch("/api/gameplay/revive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, targetId: reviveTargetId, amount }),
      });
      refreshState();
    } catch {/* independent failure */}
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
            tokenAmount={spinTokenAmount}
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
