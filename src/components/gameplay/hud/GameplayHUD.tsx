"use client";

/**
 * GameplayHUD — Master HUD Orchestrator
 *
 * Owns layout, responsive positioning, widget priorities, and phase transitions.
 * Never owns gameplay logic — it consumes props from the play page / runtime.
 *
 * Layout zones:
 *   1. Top HUD      — session intelligence (phase, timer, pool, rank, alive)
 *   2. Surge        — energy core progression
 *   3. World        — wheel + flanking live panels (feed left, squad right)
 *   4. Engage       — spin button + voice/recording
 *   5. Effects      — active effects pills
 *   6. Skills       — skill dock
 */

import "./responsive.css";
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

export type HudPhaseMode =
  | "loading"
  | "active"
  | "revive"
  | "championship"
  | "results";

interface GameplayHUDProps {
  // Session
  phase?: number;
  totalPhases?: number;
  prizePoolCents?: number;
  phaseEndsAt?: number | null;

  // Player
  tokens?: number;
  playerRank?: number;
  alivePlayers?: number;
  surgePercent?: number;

  // Spin
  isSpinning?: boolean;
  spinLocked?: boolean;
  lastOutcome?: SpinOutcome | null;
  tokenAmount?: number;
  streak?: number;
  combo?: number;
  momentum?: number;
  recentOutcomes?: SpinOutcome[];

  // Callbacks
  onSpin?: () => void;
  onSpinComplete?: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;

  // HUD phase mode
  hudPhase?: HudPhaseMode;

  // Connection
  connectionQuality?: "good" | "degraded" | "poor";
  isSynced?: boolean;
}

export function GameplayHUD({
  phase = 2,
  totalPhases = 6,
  prizePoolCents = 1_250_000,
  phaseEndsAt,
  tokens = 24.5,
  playerRank = 7,
  alivePlayers = 28,
  surgePercent = 72,
  isSpinning = false,
  spinLocked = false,
  lastOutcome = null,
  tokenAmount = 0,
  streak = 0,
  combo = 1,
  momentum = 0,
  recentOutcomes = [],
  onSpin,
  onSpinComplete = () => {},
  onTokensAwarded,
  onStealActivated,
  hudPhase = "active",
  connectionQuality = "good",
  isSynced = true,
}: GameplayHUDProps) {
  const handleSpin = () => {
    if (spinLocked || isSpinning) return;
    onSpin?.();
  };

  const handleSpinComplete = () => {
    onSpinComplete();
  };

  return (
    <div
      data-gameplay="true"
      data-phase={hudPhase}
      className="gameplay-hud-root"
    >
      {/* ---- Background layers ---- */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Deep radial centre */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 55% at 50% 42%,rgba(88,28,135,0.24),transparent 70%)" }} />
        {/* Bottom glow */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "radial-gradient(ellipse 100% 65% at 50% 100%,rgba(60,0,110,0.32),transparent 70%)" }} />
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        {/* Top fade */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg,rgba(4,2,10,0.85),transparent)" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: "linear-gradient(0deg,rgba(4,2,10,0.97),transparent)" }} />
      </div>

      {/* ---- Zone 0: safe area top ---- */}
      <div className="hud-safe-top" />

      {/* ---- Zone 1: Top HUD ---- */}
      <div className="zone-top-hud" style={{ position: "relative", zIndex: 10 }}>
        <TopHUD
          prizePoolCents={prizePoolCents}
          phase={phase}
          totalPhases={totalPhases}
          tokens={Math.round(tokens * 10) / 10}
          playerRank={playerRank}
          alivePlayers={alivePlayers}
          phaseEndsAt={phaseEndsAt}
          connectionQuality={connectionQuality}
          isSynced={isSynced}
        />
      </div>

      {/* ---- Zone 2: Shadow Surge ---- */}
      <div style={{ paddingInline: 0, position: "relative", zIndex: 10 }}>
        <ShadowSurge percent={surgePercent} playerRank={playerRank} />
      </div>

      {/* ---- Zone 3: World (Wheel + Live Panels) ---- */}
      <div className="zone-wheel" style={{ position: "relative", zIndex: 5 }}>
        <div className="wheel-container">
          {/* Live Feed — left overlay */}
          <div className="wheel-overlay-left overlay-panel">
            <LiveFeed />
          </div>

          {/* Wheel — center focus */}
          <WheelHUD
            isSpinning={isSpinning}
            outcome={lastOutcome}
            tokenAmount={tokenAmount}
            onSpinComplete={handleSpinComplete}
            onTokensAwarded={onTokensAwarded}
            onStealActivated={onStealActivated}
            streak={streak}
            combo={combo}
            momentum={momentum}
            recentOutcomes={recentOutcomes}
          />

          {/* Squad Panel — right overlay */}
          <div className="wheel-overlay-right overlay-panel">
            <SquadPanel />
          </div>
        </div>
      </div>

      {/* ---- Zone 4: Engage ---- */}
      <div className="zone-engage" style={{ position: "relative", zIndex: 10 }}>
        <div className="engage-center">
          <VoiceWidgetHUD />
          <SpinButton
            disabled={isSpinning || spinLocked}
            isSpinning={isSpinning}
            onClick={handleSpin}
          />
          <RecordingWidgetHUD />
        </div>
      </div>

      {/* ---- Zone 5: Active Effects ---- */}
      <ActiveEffects />

      {/* ---- Zone 6: Skill Dock ---- */}
      <SkillDockHUD />

      {/* ---- Zone 7: safe area bottom ---- */}
      <div className="hud-safe-bottom" />

      {/* Dev only: HUD Studio test widget */}
      <TestWidget />
    </div>
  );
}
