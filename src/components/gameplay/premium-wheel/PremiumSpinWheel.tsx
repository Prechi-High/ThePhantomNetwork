"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SpinStateMachine } from "@/lib/spin/stateMachine";
import { SPIN_TIMINGS, WHEEL_CONFIG, OUTCOME_CONFIG } from "@/config/spinConfig";
import { SpinWheelCore } from "./SpinWheelCore";
import { OutcomeCard } from "./OutcomeCard";
import { TokenCollectionAnimator } from "./TokenCollectionAnimator";

interface PremiumSpinWheelProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
}

/**
 * Premium Spin Wheel Orchestrator
 * Manages the complete cinematic experience:
 * 1. 6-second spin with camera effects
 * 2. 3-second reveal sequence
 * 3. Token collection animation
 * 4. Steal selection transition
 */
export function PremiumSpinWheel({
  isSpinning,
  outcome,
  onSpinComplete,
  onTokensAwarded,
  onStealActivated,
}: PremiumSpinWheelProps) {
  const [stateMachine] = useState(() => new SpinStateMachine());
  const [showOutcome, setShowOutcome] = useState(false);
  const [showTokenAnimation, setShowTokenAnimation] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [screenDarken, setScreenDarken] = useState(0);

  // Start spin sequence
  useEffect(() => {
    if (isSpinning && outcome && stateMachine.canSpin()) {
      startSpinSequence();
    }
  }, [isSpinning, outcome]);

  const startSpinSequence = useCallback(async () => {
    // PHASE 1: Spin Start (0-300ms)
    stateMachine.transition('START_SPIN');
    setCameraZoom(WHEEL_CONFIG.CAMERA_ZOOM_SCALE);
    setScreenDarken(WHEEL_CONFIG.DARKEN_OPACITY);

    // PHASE 2-4: Spinning (handled by SpinWheelCore)
    // Will call handleWheelSpinComplete when done
  }, [stateMachine]);

  const handleWheelSpinComplete = useCallback(async () => {
    // PHASE 5: Wheel Locked
    stateMachine.transition('SPIN_COMPLETE');
    stateMachine.transition('SPIN_COMPLETE'); // SPINNING -> DECELERATING
    stateMachine.transition('SPIN_COMPLETE'); // DECELERATING -> LOCKED

    // Reset camera
    setCameraZoom(1);
    setScreenDarken(0);

    // Brief pause before reveal
    await delay(300);

    // PHASE 6: Reveal Sequence
    startRevealSequence();
  }, [stateMachine]);

  const startRevealSequence = useCallback(async () => {
    if (!outcome) return;

    stateMachine.transition('REVEAL_BEGIN');

    // Darken screen slightly
    setScreenDarken(0.2);

    // Energy formation (300ms)
    await delay(SPIN_TIMINGS.REVEAL_PAUSE);

    // Light burst (500ms)
    await delay(SPIN_TIMINGS.REVEAL_ENERGY_START - SPIN_TIMINGS.REVEAL_PAUSE);

    // Screen flash
    await delay(SPIN_TIMINGS.REVEAL_BURST - SPIN_TIMINGS.REVEAL_ENERGY_START);

    // Outcome card appears
    setShowOutcome(true);
    stateMachine.transition('REVEAL_COMPLETE');

    // Play outcome sound
    playOutcomeSound(outcome);

    // Apply camera shake
    applyCameraShake(outcome);

    // PHASE 7: Token Collection or Steal
    await delay(SPIN_TIMINGS.REVEAL_CARD_APPEAR - SPIN_TIMINGS.REVEAL_BURST);

    const config = OUTCOME_CONFIG[outcome];
    const tokenValue = getTokenValue(outcome);

    if (outcome === 'STEAL') {
      // Transition to steal selection
      stateMachine.transition('STEAL_SELECTED');
      await delay(1000);
      setShowOutcome(false);
      setScreenDarken(0);
      onStealActivated?.();
      stateMachine.transition('COOLDOWN_END');
      stateMachine.transition('COOLDOWN_END');
      stateMachine.transition('RESET');
      onSpinComplete();
    } else if (tokenValue > 0) {
      // Start token collection
      stateMachine.transition('TOKENS_COLLECTED');
      setShowTokenAnimation(true);
    } else {
      // VOID - just fade away
      await delay(1500);
      setShowOutcome(false);
      setScreenDarken(0);
      stateMachine.transition('COOLDOWN_END');
      stateMachine.transition('COOLDOWN_END');
      stateMachine.transition('RESET');
      onSpinComplete();
    }
  }, [outcome, stateMachine, onSpinComplete, onStealActivated]);

  const handleTokenCollectionComplete = useCallback(async () => {
    if (!outcome) return;

    const tokenValue = getTokenValue(outcome);
    onTokensAwarded?.(tokenValue);

    setShowTokenAnimation(false);
    await delay(300);
    setShowOutcome(false);
    setScreenDarken(0);

    stateMachine.transition('COOLDOWN_END');
    stateMachine.transition('COOLDOWN_END');
    stateMachine.transition('RESET');
    onSpinComplete();
  }, [outcome, stateMachine, onSpinComplete, onTokensAwarded]);

  return (
    <div className="relative w-full h-full">
      {/* Screen Darken Overlay */}
      <AnimatePresence>
        {screenDarken > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: screenDarken }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Camera Container */}
      <motion.div
        animate={{
          scale: cameraZoom,
        }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        {/* Spin Wheel */}
        <div className="relative mx-auto h-[min(72vw,320px)] w-[min(72vw,320px)] sm:h-80 sm:w-80">
          <SpinWheelCore
            isSpinning={isSpinning}
            outcome={outcome}
            onSpinComplete={handleWheelSpinComplete}
          />
        </div>
      </motion.div>

      {/* Outcome Reveal Card */}
      <AnimatePresence>
        {showOutcome && outcome && (
          <OutcomeCard outcome={outcome} visible={showOutcome} />
        )}
      </AnimatePresence>

      {/* Token Collection Animation */}
      <AnimatePresence>
        {showTokenAnimation && outcome && (
          <TokenCollectionAnimator
            outcome={outcome}
            tokenAmount={getTokenValue(outcome)}
            onComplete={handleTokenCollectionComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTokenValue(outcome: SpinOutcome): number {
  switch (outcome) {
    case 'ADVANCE':
      return 3;
    case 'ACQUIRE':
      return 1;
    case 'DISCOVER':
      return 0.5;
    default:
      return 0;
  }
}

function playOutcomeSound(outcome: SpinOutcome): void {
  const soundMap: Record<SpinOutcome, string> = {
    ADVANCE: '/audio/wheel/outcome-advance.mp3',
    ACQUIRE: '/audio/wheel/outcome-acquire.mp3',
    DISCOVER: '/audio/wheel/outcome-discover.mp3',
    STEAL: '/audio/wheel/outcome-steal.mp3',
    VOID: '/audio/wheel/outcome-void.mp3',
  };

  const audio = new Audio(soundMap[outcome]);
  audio.volume = 0.7;
  audio.play().catch(() => {
    // Silent fail if audio doesn't load
  });
}

function applyCameraShake(outcome: SpinOutcome): void {
  const config = OUTCOME_CONFIG[outcome];
  if (config.cameraShake === 'none') return;

  const intensity = {
    subtle: 2,
    medium: 4,
    strong: 8,
  }[config.cameraShake] || 0;

  // Trigger shake animation on body or viewport element
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.transform = `translate(${intensity}px, ${intensity}px)`;
    setTimeout(() => {
      root.style.transform = `translate(-${intensity}px, -${intensity}px)`;
    }, 50);
    setTimeout(() => {
      root.style.transform = 'translate(0, 0)';
    }, 100);
  }
}
