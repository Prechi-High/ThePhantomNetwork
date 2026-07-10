"use client";

import type { SpinOutcome } from "@/types/gameplay";
import { PremiumSpinWheel } from "@/components/gameplay/premium-wheel";

interface WheelHUDProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
  onTokensAwarded?: (amount: number) => void;
}

/**
 * Wheel HUD - Premium Cinematic Spin Wheel
 * Integrates the redesigned 5-segment wheel system into the gameplay HUD
 */
export function WheelHUD({ isSpinning, outcome, onSpinComplete, onTokensAwarded }: WheelHUDProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "--wheel-size": "min(72vw, 320px)",
      } as React.CSSProperties}
    >
      <PremiumSpinWheel
        isSpinning={isSpinning}
        outcome={outcome}
        onSpinComplete={onSpinComplete}
        onTokensAwarded={onTokensAwarded}
      />
    </div>
  );
}
