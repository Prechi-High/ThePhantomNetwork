"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { GameplayStateMachine, transitionSpinLegacyEvent } from "@/lib/spin/stateMachine";
import { SPIN_TIMINGS, REVEAL_TIMINGS, TOKEN_TIMINGS } from "@/config/spinConfig";
import { SpinAnimator } from "./SpinAnimator";
import { RevealSequence } from "./RevealSequence";
import { OutcomeCard } from "./OutcomeCard";
import { TokenCollectionAnimator } from "./TokenCollectionAnimator";
import { ParticleController } from "./ParticleController";
import { OutcomeCelebration } from "./OutcomeCelebration";
import { ButtonAnimator } from "./ButtonAnimator";
import { interactionController } from "@/lib/motion/InteractionController";

interface PremiumSpinWheelProps {
  /** True while the server spin request is in flight + while animating */
  isSpinning: boolean;
  /** Server-provided outcome — null until server responds */
  outcome: SpinOutcome | null;
  /** Token amount for this spin (from server) */
  tokenAmount?: number;
  /** Called when all animations complete (next spin unlocks) */
  onSpinComplete: () => void;
  /** Called each time a token particle lands (lets parent update counter) */
  onTokensAwarded?: (amount: number) => void;
  /** Called when STEAL outcome resolves (before token collection) */
  onStealActivated?: () => void;
  /** Called when user presses Engage (before spin starts) */
  onEngagePress?: () => void;
  /** Disable the button entirely (e.g. not player's turn, eliminated) */
  disabled?: boolean;
}

export function PremiumSpinWheel({
  isSpinning,
  outcome,
  tokenAmount = 0,
  onSpinComplete,
  onTokensAwarded,
  onStealActivated,
  onEngagePress,
  disabled = false,
}: PremiumSpinWheelProps) {
  const [stateMachine] = useState(() => new GameplayStateMachine());
  const [showReveal, setShowReveal]           = useState(false);
  const [showCard, setShowCard]               = useState(false);
  const [showParticles, setShowParticles]     = useState(false);
  const [showTokens, setShowTokens]           = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [screenDarken, setScreenDarken]       = useState(0);
  const [processing, setProcessing]           = useState(false);

  // ── Timer management ────────────────────────────────────────────────────
  // timersRef holds all mid-sequence timers (reveal, particles, tokens…).
  // completionTimerRef holds ONLY the final "unlock" timer so the reset
  // useEffect cannot accidentally cancel it (Fix 3).
  const timersRef        = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref to latest onSpinComplete so closures never go stale (Fix 4).
  const onSpinCompleteRef = useRef(onSpinComplete);
  useEffect(() => { onSpinCompleteRef.current = onSpinComplete; }, [onSpinComplete]);

  // Stable ref to latest tokenAmount for use inside handleAnimateStart closure.
  const tokenAmountRef = useRef(tokenAmount);
  useEffect(() => { tokenAmountRef.current = tokenAmount; }, [tokenAmount]);

  // Stable ref to latest outcome for handleCardShow.
  const outcomeRef = useRef(outcome);
  useEffect(() => { outcomeRef.current = outcome; }, [outcome]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      interactionController.stopSound("spin_loop", 150);
      interactionController.stopSound("spin_start", 100);
    };
  }, [clearTimers]);

  // ── Reset when idle ───────────────────────────────────────────────────────
  // Only runs when BOTH isSpinning and processing are false.
  // Does NOT cancel completionTimerRef — that fires independently (Fix 3).
  useEffect(() => {
    if (!isSpinning && !processing) {
      clearTimers();
      stateMachine.forceTransition("NEXT_SPIN_READY", "wheel idle reset");
      setShowReveal(false);
      setShowCard(false);
      setShowParticles(false);
      setShowTokens(false);
      setShowCelebration(false);
      setScreenDarken(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, processing]);

  // ── Launch immediately on spin (Rule 4: no waiting for network) ───────────
  useEffect(() => {
    if (!isSpinning || processing) return;

    setProcessing(true);

    if (!transitionSpinLegacyEvent(stateMachine, "START_SPIN")) {
      stateMachine.forceTransition("NEXT_SPIN_READY", "spin retry");
      transitionSpinLegacyEvent(stateMachine, "START_SPIN");
    }

    setScreenDarken(0.3);
    interactionController.playEffect("ui_button_press");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  // ── finishSpin — FIX 3: uses completionTimerRef, not timersRef ──────────
  const finishSpin = useCallback(() => {
    clearTimers();
    setShowReveal(false);
    setShowCard(false);
    setShowParticles(false);
    setScreenDarken(0);
    stateMachine.transition("NEXT_SPIN_READY", "cooldown");

    // Use dedicated ref so reset useEffect can't kill this timer
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    completionTimerRef.current = setTimeout(() => {
      completionTimerRef.current = null;
      setProcessing(false);
      onSpinCompleteRef.current();   // always latest callback (Fix 4)
    }, SPIN_TIMINGS.SPIN_COOLDOWN);
  }, [clearTimers, stateMachine]);

  // ── Wheel stop callback ───────────────────────────────────────────────────
  const handleWheelStop = useCallback(() => {
    transitionSpinLegacyEvent(stateMachine, "SPIN_COMPLETE");
    setScreenDarken(0);

    schedule(() => {
      transitionSpinLegacyEvent(stateMachine, "REVEAL_BEGIN");
      setShowReveal(true);
    }, REVEAL_TIMINGS.SUSPENSE_PAUSE);
  }, [stateMachine, schedule]);

  // ── Card visible callback ─────────────────────────────────────────────────
  const handleCardShow = useCallback(() => {
    transitionSpinLegacyEvent(stateMachine, "REVEAL_COMPLETE");
    setShowCard(true);
    // Outcome FX triggered by RevealSequence at light-burst phase
  }, [stateMachine]);

  // ── Animations + particles start — FIX 4: reads refs, no stale deps ──────
  const handleAnimateStart = useCallback(() => {
    setShowParticles(true);
    const currentOutcome   = outcomeRef.current;
    const currentTokenAmt  = tokenAmountRef.current;
    if (!currentOutcome) return;

    const SETTLE = 250;

    if (currentOutcome === "STEAL") {
      schedule(() => {
        onStealActivated?.();
        schedule(finishSpin, 400);
      }, SETTLE + 350);
    } else if (currentTokenAmt > 0) {
      schedule(() => setShowTokens(true), SETTLE);
    } else {
      // VOID — no tokens
      schedule(finishSpin, SETTLE + TOKEN_TIMINGS.TOKEN_FLY_DURATION);
    }
  }, [schedule, finishSpin, onStealActivated]);

  // ── Token collection complete ─────────────────────────────────────────────
  const handleTokensComplete = useCallback(() => {
    setShowTokens(false);
    setShowCelebration(true);
    schedule(() => {
      setShowCelebration(false);
      finishSpin();
    }, 700);
  }, [schedule, finishSpin]);

  // ── Environment lighting ──────────────────────────────────────────────────
  const revealLighting = showCard && outcome
    ? {
        background: `radial-gradient(circle, ${glowForOutcome(outcome)} 0%, rgba(8,4,21,0.85) 80%)`,
        zIndex: 38,
      }
    : null;

  return (
    <div className="relative w-full h-full">
      {/* Screen darken */}
      <AnimatePresence>
        {screenDarken > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: screenDarken }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-black pointer-events-none"
            style={{ zIndex: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Thematic environment lighting */}
      <AnimatePresence>
        {revealLighting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none"
            style={revealLighting}
          />
        )}
      </AnimatePresence>

      {/* Wheel glow layer — code-driven motion */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ zIndex: 1 }}>
        <div
          data-motion-layer="wheel_glow"
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 65%)",
            animation: "wheelGlowPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Wheel — fixed size; no scale transform (scale shifts surrounding layout) */}
      <div className="relative w-full h-full">
        <SpinAnimator
          isSpinning={isSpinning && (stateMachine.isSpinning() || processing)}
          outcome={outcome}
          onSpinComplete={handleWheelStop}
        />
      </div>

      {/* Cinematic reveal */}
      {outcome && (
        <RevealSequence
          outcome={outcome}
          active={showReveal}
          onCardShow={handleCardShow}
          onAnimateStart={handleAnimateStart}
        />
      )}

      {/* Outcome card */}
      {outcome && (
        <OutcomeCard
          outcome={outcome}
          visible={showCard}
          tokenAmount={tokenAmount}
        />
      )}

      {/* Particle burst */}
      {outcome && (
        <ParticleController outcome={outcome} active={showParticles} />
      )}

      {/* Token flight */}
      <AnimatePresence>
        {showTokens && outcome && tokenAmount > 0 && (
          <TokenCollectionAnimator
            outcome={outcome}
            tokenAmount={tokenAmount}
            onComplete={handleTokensComplete}
            onTokenArrived={onTokensAwarded}
          />
        )}
      </AnimatePresence>

      {/* Outcome celebration */}
      {outcome && (
        <OutcomeCelebration outcome={outcome} visible={showCelebration} />
      )}
    </div>
  );
}

// Re-export alias
export { PremiumSpinWheel as SpinWheel };

// ── Glow colour helper ───────────────────────────────────────────────────────
function glowForOutcome(outcome: SpinOutcome): string {
  const map: Record<SpinOutcome, string> = {
    ADVANCE:  "rgba(245,158,11,0.35)",
    ACQUIRE:  "rgba(234,179,8,0.32)",
    DISCOVER: "rgba(59,130,246,0.28)",
    STEAL:    "rgba(239,68,68,0.35)",
    VOID:     "rgba(107,114,128,0.12)",
  };
  return map[outcome] ?? "rgba(168,85,247,0.25)";
}

// ── Expose ButtonAnimator ────────────────────────────────────────────────────
export { ButtonAnimator };
