"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SpinStateMachine } from "@/lib/spin/stateMachine";
import { SPIN_TIMINGS, REVEAL_TIMINGS, TOKEN_TIMINGS } from "@/config/spinConfig";
import { SpinAnimator } from "./SpinAnimator";
import { RevealSequence } from "./RevealSequence";
import { OutcomeCard } from "./OutcomeCard";
import { TokenCollectionAnimator } from "./TokenCollectionAnimator";
import { ParticleController } from "./ParticleController";
import { OutcomeCelebration } from "./OutcomeCelebration";
import { ButtonAnimator } from "./ButtonAnimator";
import { spinAudio } from "./SpinAudioController";

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

/**
 * PremiumSpinWheel — Composition root for the wheel subsystem
 *
 * Connects runtime events → presentation only.
 * No gameplay logic lives here — it all comes from the runtime via props.
 *
 * Animation sequence:
 *   Engage press
 *   → wheel spins (6 s)
 *   → silence pause (0.3 s)
 *   → cinematic reveal (3 s)
 *   → token collection (1 s)
 *   → celebration flourish
 *   → ready
 */
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
  const [stateMachine] = useState(() => new SpinStateMachine());
  const [showReveal, setShowReveal] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [screenDarken, setScreenDarken] = useState(0);
  const [processing, setProcessing] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      spinAudio.stopAll();
    };
  }, []);

  // Reset when idle
  useEffect(() => {
    if (!isSpinning && !processing) {
      clearTimers();
      stateMachine.reset();
      setShowReveal(false);
      setShowCard(false);
      setShowParticles(false);
      setShowTokens(false);
      setShowCelebration(false);
      setScreenDarken(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, processing]);

  // Launch sequence when spin + outcome both arrive
  useEffect(() => {
    if (isSpinning && outcome && !processing && stateMachine.canSpin()) {
      setProcessing(true);
      stateMachine.transition("START_SPIN");
      setScreenDarken(0.3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, outcome]);

  // ---- Wheel stop callback ----
  const handleWheelStop = useCallback(() => {
    stateMachine.transition("SPIN_COMPLETE");
    setScreenDarken(0);

    // Brief silence before reveal
    schedule(() => {
      stateMachine.transition("REVEAL_BEGIN");
      setShowReveal(true);
    }, REVEAL_TIMINGS.SUSPENSE_PAUSE);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateMachine]);

  // ---- Card visible callback ----
  const handleCardShow = useCallback(() => {
    stateMachine.transition("REVEAL_COMPLETE");
    setShowCard(true);
    if (outcome) spinAudio.playOutcome(outcome);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateMachine, outcome]);

  // ---- Animations + particles start ----
  const handleAnimateStart = useCallback(async () => {
    setShowParticles(true);
    if (!outcome) return;

    // Delay before next phase
    const SETTLE = 600;

    if (outcome === "STEAL") {
      schedule(() => {
        onStealActivated?.();
        schedule(finishSpin, 800);
      }, SETTLE + 600);
    } else if (tokenAmount > 0) {
      schedule(() => {
        setShowTokens(true);
      }, SETTLE);
    } else {
      // VOID — no tokens, just finish
      schedule(finishSpin, SETTLE + TOKEN_TIMINGS.TOKEN_FLY_DURATION);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, tokenAmount]);

  // ---- Token collection complete ----
  const handleTokensComplete = useCallback(() => {
    setShowTokens(false);
    // Brief celebration beat
    setShowCelebration(true);
    schedule(() => {
      setShowCelebration(false);
      finishSpin();
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Finish ----
  const finishSpin = useCallback(() => {
    clearTimers();
    setShowReveal(false);
    setShowCard(false);
    setShowParticles(false);
    setScreenDarken(0);
    stateMachine.transition("COOLDOWN_END");
    schedule(() => {
      setProcessing(false);
      onSpinComplete();
    }, SPIN_TIMINGS.SPIN_COOLDOWN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateMachine, onSpinComplete]);

  // ---- Environment lighting while revealing ----
  const revealLighting =
    showCard && outcome
      ? {
          background: `radial-gradient(circle, ${"STEAL" === outcome
            ? "rgba(239,68,68,0.35)"
            : "VOID" === outcome
            ? "rgba(0,0,0,0.3)"
            : `${import_glow(outcome)}`} 0%, rgba(8,4,21,0.85) 80%)`,
          zIndex: 38,
        }
      : null;

  return (
    <div className="relative w-full h-full">
      {/* Cinematic screen darkening */}
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

      {/* Wheel */}
      <motion.div
        animate={{ scale: processing ? 1.04 : 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <SpinAnimator
          isSpinning={!!outcome && stateMachine.isSpinning()}
          outcome={outcome}
          onSpinComplete={handleWheelStop}
        />
      </motion.div>

      {/* Cinematic reveal sequence */}
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

// ---- Helper: glow colour by outcome ----
function import_glow(outcome: SpinOutcome): string {
  const glows: Record<SpinOutcome, string> = {
    ADVANCE: "rgba(255,215,0,0.35)",
    ACQUIRE: "rgba(16,185,129,0.3)",
    DISCOVER: "rgba(59,130,246,0.3)",
    STEAL: "rgba(239,68,68,0.35)",
    VOID: "rgba(107,114,128,0.15)",
  };
  return glows[outcome] ?? "rgba(139,92,246,0.25)";
}

// ---- Expose ButtonAnimator for external use ----
export { ButtonAnimator };
