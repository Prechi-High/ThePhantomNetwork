"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { SpinStateMachine, type SpinState } from "@/lib/spin/stateMachine";
import { SPIN_TIMINGS, WHEEL_CONFIG, OUTCOME_CONFIG } from "@/config/spinConfig";
import { SpinAnimator } from "./SpinAnimator";
import { RevealSequence } from "./RevealSequence";
import { OutcomeCard } from "./OutcomeCard";
import { TokenCollectionAnimator } from "./TokenCollectionAnimator";
import { ParticleController } from "./ParticleController";
import { spinAudio } from "./SpinAudioController";

interface PremiumSpinWheelProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
}

/**
 * SpinWheel (PremiumSpinWheel) Orchestrator Component
 * Central state machine coordinator for the cinematic 10-second spin experience.
 * Orchestrates:
 * 1. Spin Start, High-Speed, Deceleration, and Stop lock (0.0s - 6.0s)
 * 2. Cinematic Reveal sequence (6.0s - 9.0s)
 * 3. Particle bursts & Environment lighting overlays
 * 4. Token Bezier flight & Sequential token awards (9.0s - 10.0s)
 * 5. Automatic transition into Steal Target Picker (for STEAL outcomes)
 */
export function SpinWheel({
  isSpinning,
  outcome,
  onSpinComplete,
  onTokensAwarded,
  onStealActivated,
}: PremiumSpinWheelProps) {
  const [stateMachine] = useState(() => new SpinStateMachine());
  const [currentState, setCurrentState] = useState<SpinState>("IDLE");
  
  const [showCard, setShowCard] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [screenDarken, setScreenDarken] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track tokens awarded to avoid double trigger
  const tokensAwardedRef = useRef(false);

  // Sync state machine updates with React local state
  useEffect(() => {
    const unsub = stateMachine.on(stateMachine.getCurrentState(), (state) => {
      setCurrentState(state);
    });
    return () => unsub();
  }, [stateMachine]);

  // Clean up sounds and reset on unmount
  useEffect(() => {
    return () => {
      spinAudio.stopAll();
    };
  }, []);

  // Reset when not spinning & idle
  useEffect(() => {
    if (!isSpinning && !isProcessing) {
      stateMachine.reset();
      setCurrentState("IDLE");
      setShowCard(false);
      setParticlesActive(false);
      setCameraZoom(1);
      setScreenDarken(0);
      tokensAwardedRef.current = false;
    }
  }, [isSpinning, isProcessing, stateMachine]);

  // Handle automatic flow of the spin phases
  useEffect(() => {
    if (isSpinning && outcome && stateMachine.canSpin() && !isProcessing) {
      setIsProcessing(true);
      tokensAwardedRef.current = false;
      executeSpinFlow();
    }
  }, [isSpinning, outcome, isProcessing]);

  const executeSpinFlow = useCallback(async () => {
    console.log("[SpinWheel] Launching 6-second spin sequence");
    
    // 0.0s: Impulse / Spin Start
    stateMachine.transition("START_SPIN");
    setCameraZoom(WHEEL_CONFIG.CAMERA_ZOOM_SCALE);
    setScreenDarken(WHEEL_CONFIG.DARKEN_OPACITY);

    // 0.3s: Shift state to high-speed spinning
    const spinningTimer = setTimeout(() => {
      stateMachine.transition("SPIN_COMPLETE"); // SPIN_START -> SPINNING
    }, SPIN_TIMINGS.IMPULSE_DURATION);

    // 4.8s: Shift state to progressive deceleration
    const deceleratingTimer = setTimeout(() => {
      stateMachine.transition("SPIN_COMPLETE"); // SPINNING -> DECELERATING
    }, SPIN_TIMINGS.SLOWDOWN_START);

    return () => {
      clearTimeout(spinningTimer);
      clearTimeout(deceleratingTimer);
    };
  }, [stateMachine]);

  // Called when physical spin stops (at 6.0s)
  const handleWheelStop = useCallback(async () => {
    console.log("[SpinWheel] Wheel locked at final angle");
    stateMachine.transition("SPIN_COMPLETE"); // DECELERATING -> LOCKED

    // Reset camera zoom and darken before reveal pause
    setCameraZoom(1);
    setScreenDarken(0);

    // 0.0s - 0.3s Pause after wheel stop (audio cuts slightly, screen darkens)
    await delay(300);

    // Transition to REVEAL_START
    stateMachine.transition("REVEAL_BEGIN"); // LOCKED -> REVEAL_START
    setScreenDarken(0.3); // Background darkens for reveal
  }, [stateMachine]);

  // Phase 1.3s: Card Explodes into view
  const handleCardExplosion = useCallback(() => {
    console.log("[SpinWheel] Outcome card exploded into view");
    stateMachine.transition("REVEAL_COMPLETE"); // REVEAL_START -> OUTCOME_REVEAL
    
    // Play specific outcome sound
    if (outcome) {
      spinAudio.playOutcome(outcome);
    }
    
    setShowCard(true);
  }, [outcome, stateMachine]);

  // Phase 1.5s: Particles and flying sequence start
  const handleAnimateStart = useCallback(async () => {
    console.log("[SpinWheel] Particle emissions and visual sequences activated");
    setParticlesActive(true);

    if (!outcome) return;

    // Wait until card presentation before starting token flight or target selector
    await delay(600); 

    if (outcome === "STEAL") {
      // STEAL: automatic transition to target picker
      stateMachine.transition("STEAL_SELECTED"); // OUTCOME_REVEAL -> STEAL_SELECTION
      
      // Keep reveal visible for 1s to view red/smoke style
      await delay(1200);

      // Trigger victim picker
      if (onStealActivated) {
        onStealActivated();
      }
      
      // Complete selection and finish spin
      stateMachine.transition("COOLDOWN_END"); // STEAL_SELECTION -> REVEAL_COMPLETE
      finishSpin();
    } else if (["ADVANCE", "ACQUIRE", "DISCOVER"].includes(outcome)) {
      // TOKENS: trigger bezier collection animation
      stateMachine.transition("TOKENS_COLLECTED"); // OUTCOME_REVEAL -> TOKEN_COLLECTION
    } else {
      // VOID: pause shortly, then fade out
      await delay(1200);
      stateMachine.transition("COOLDOWN_END"); // OUTCOME_REVEAL -> REVEAL_COMPLETE
      finishSpin();
    }
  }, [outcome, stateMachine, onStealActivated]);

  // Called when token collection bezier finishes
  const handleTokenCollectionComplete = useCallback(() => {
    console.log("[SpinWheel] Token collection finished");
    stateMachine.transition("COOLDOWN_END"); // TOKEN_COLLECTION -> REVEAL_COMPLETE
    finishSpin();
  }, [stateMachine]);

  // Sequentially awards tokens as they land in HUD
  const handleSingleTokenArrival = useCallback((amount: number) => {
    if (onTokensAwarded) {
      onTokensAwarded(amount);
    }
  }, [onTokensAwarded]);

  const finishSpin = useCallback(async () => {
    console.log("[SpinWheel] Cleanup and cooldown phase");
    setShowCard(false);
    setParticlesActive(false);
    setScreenDarken(0);

    stateMachine.transition("COOLDOWN_END"); // REVEAL_COMPLETE -> COOLDOWN
    
    // Cooldown duration before enabling next spin (500ms)
    await delay(500);

    stateMachine.transition("COOLDOWN_END"); // COOLDOWN -> READY
    stateMachine.transition("RESET"); // READY -> IDLE

    setIsProcessing(false);
    onSpinComplete();
  }, [stateMachine, onSpinComplete]);

  // Build environmental lighting override style based on state and outcome
  const getRevealLightingStyle = () => {
    if (!outcome) return {};
    const config = OUTCOME_CONFIG[outcome];

    // Steal selection turns environment completely red
    if (currentState === "STEAL_SELECTION") {
      return {
        background: "radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(12, 4, 4, 0.95) 80%)",
        opacity: 0.85,
        zIndex: 42,
      };
    }

    // Default reveal overlays
    if (["REVEAL_START", "OUTCOME_REVEAL", "TOKEN_COLLECTION"].includes(currentState)) {
      return {
        background: `radial-gradient(circle, ${config.glow} 0%, rgba(8, 4, 21, 0.9) 75%)`,
        opacity: 0.6,
        zIndex: 42,
      };
    }

    return {};
  };

  return (
    <div className="relative w-full h-full">
      {/* Screen Darken / Cinematic Overlay */}
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

      {/* Unique Environment Lighting Overlay */}
      <AnimatePresence>
        {currentState !== "IDLE" && outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none transition-all duration-500"
            style={getRevealLightingStyle()}
          />
        )}
      </AnimatePresence>

      {/* Main Wheel Camera Container */}
      <motion.div
        animate={{
          scale: cameraZoom,
        }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <SpinAnimator
          isSpinning={currentState !== "IDLE" && currentState !== "LOCKED" && currentState !== "READY" && !stateMachine.isRevealing() && currentState !== "TOKEN_COLLECTION" && currentState !== "STEAL_SELECTION" && currentState !== "REVEAL_COMPLETE" && currentState !== "COOLDOWN"}
          outcome={outcome}
          onSpinComplete={handleWheelStop}
        />
      </motion.div>

      {/* Cinematic Reveal Orchestrator */}
      {outcome && (
        <RevealSequence
          outcome={outcome}
          active={["REVEAL_START", "OUTCOME_REVEAL"].includes(currentState)}
          onCardShow={handleCardExplosion}
          onAnimateStart={handleAnimateStart}
        />
      )}

      {/* Flying Particle Emitters */}
      {outcome && particlesActive && (
        <ParticleController
          outcome={outcome}
          active={particlesActive}
        />
      )}

      {/* Floating 3D Outcome Card */}
      <AnimatePresence>
        {showCard && outcome && (
          <OutcomeCard
            outcome={outcome}
            visible={showCard}
          />
        )}
      </AnimatePresence>

      {/* Bezier Flying Token Animation */}
      <AnimatePresence>
        {currentState === "TOKEN_COLLECTION" && outcome && (
          <TokenCollectionAnimator
            outcome={outcome}
            tokenAmount={getTokenValue(outcome)}
            onComplete={handleTokenCollectionComplete}
            onTokenArrived={handleSingleTokenArrival}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-export as PremiumSpinWheel for compatibility
export { SpinWheel as PremiumSpinWheel };

// ============================================================================
// HELPER UTILITIES
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTokenValue(outcome: SpinOutcome): number {
  switch (outcome) {
    case "ADVANCE":
      return 3;
    case "ACQUIRE":
      return 1;
    case "DISCOVER":
      return 0.5;
    default:
      return 0;
  }
}
