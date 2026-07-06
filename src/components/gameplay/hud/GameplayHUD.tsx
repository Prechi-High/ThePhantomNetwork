"use client";

/**
 * GameplayHUD v3 — Responsive grid rebuild.
 * Built on:
 *  - 12-column CSS Grid system
 *  - clamp() for all sizing
 *  - Percentage-based vertical zones (18% / 46% / 14% / 22%)
 *  - No fixed pixel widths/heights
 *  - Glass overlays for Live Feed + Squad
 *  - Matches reference spatial balance exactly
 */

import "./responsive.css";
import { useState } from "react";
import type { SpinOutcome } from "@/types/gameplay";
import { TopHUD } from "./TopHUD";
import { ShadowSurge } from "./ShadowSurge";
import { LiveFeed } from "./LiveFeed";
import { SquadPanel } from "./SquadPanel";
import { WheelHUD } from "./WheelHUD";
import { SpinButton } from "./SpinButton";
import { VoiceWidgetHUD } from "./VoiceWidget";
import { RecordingWidgetHUD } from "./RecordingWidget";
import { ActiveEffects } from "./ActiveEffects";
import { SkillDockHUD } from "./SkillDockHUD";
import { TestWidget } from "./TestWidget";

interface GameplayHUDProps {
  phase?: number;
  totalPhases?: number;
  prizePoolCents?: number;
  tokens?: number;
  playerRank?: number;
  alivePlayers?: number;
  surgePercent?: number;
  isSpinning?: boolean;
  spinLocked?: boolean;
  lastOutcome?: SpinOutcome | null;
  onSpin?: () => void;
  onSpinComplete?: () => void;
}

export function GameplayHUD({
  phase = 2,
  totalPhases = 6,
  prizePoolCents = 1250000,
  tokens = 24.5,
  playerRank = 7,
  alivePlayers = 28,
  surgePercent = 72,
  isSpinning = false,
  spinLocked = false,
  lastOutcome = null,
  onSpin,
  onSpinComplete = () => {},
}: GameplayHUDProps) {
  const [spinning, setSpinning] = useState(isSpinning);

  const handleSpin = () => {
    if (spinLocked || spinning) return;
    setSpinning(true);
    onSpin?.();
  };

  const handleSpinComplete = () => {
    setSpinning(false);
    onSpinComplete();
  };

  return (
    <div data-gameplay="true" className="gameplay-hud-root">
      {/* ════════════════════════════════════
          BACKGROUND LAYERS (absolute, z-0)
      ════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 75% 55% at 50% 42%,rgba(88,28,135,0.24),transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "radial-gradient(ellipse 100% 65% at 50% 100%,rgba(60,0,110,0.32),transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100px",
            background: "linear-gradient(180deg,rgba(4,2,10,0.85),transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "220px",
            background: "linear-gradient(0deg,rgba(4,2,10,0.97),transparent)",
          }}
        />
      </div>

      {/* ════════════════════════════════════
          ZONE 1: TOP HUD (18%)
      ════════════════════════════════════ */}
      <div />
      <div className="zone-top-hud">
        <TopHUD
          prizePoolCents={prizePoolCents}
          phase={phase}
          totalPhases={totalPhases}
          tokens={Math.round(tokens * 10) / 10}
          playerRank={playerRank}
          alivePlayers={alivePlayers}
        />
        <ShadowSurge percent={surgePercent} playerRank={playerRank} />
      </div>

      {/* ════════════════════════════════════
          ZONE 2: WHEEL ZONE (46%)
      ════════════════════════════════════ */}
      <div className="zone-wheel">
        <div className="wheel-container">
          <WheelHUD
            isSpinning={spinning}
            outcome={lastOutcome}
            onSpinComplete={handleSpinComplete}
          />

          {/* Live Feed overlay (left) */}
          <div className="wheel-overlay-left overlay-panel">
            <LiveFeed />
          </div>

          {/* Squad Panel overlay (right) */}
          <div className="wheel-overlay-right overlay-panel">
            <SquadPanel />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          ZONE 3: CONTROLS (14%)
      ════════════════════════════════════ */}
      <div className="zone-controls">
        <div className="spin-button-container">
          <SpinButton
            disabled={spinning || spinLocked}
            onClick={handleSpin}
            isSpinning={spinning}
          />
        </div>
        <div className="controls-row">
          <VoiceWidgetHUD />
          <RecordingWidgetHUD />
        </div>
      </div>

      {/* ════════════════════════════════════
          ZONE 4: EFFECTS + SKILLS (auto)
      ════════════════════════════════════ */}
      <div className="zone-bottom">
        <ActiveEffects />
        <SkillDockHUD />
      </div>

      <div />

      {/* ════════════════════════════════════
          HUD STUDIO TEST WIDGET (Dev Only)
      ════════════════════════════════════ */}
      <TestWidget />
    </div>
  );
}
