"use client";

/**
 * GameplayHUD — Master HUD Orchestrator
 *
 * Layout matches the reference arena design with live API-driven widgets.
 */

import "./responsive.css";
import type { SpinOutcome } from "@/types/gameplay";
import { TopHUD } from "./TopHUD";
import { LiveFeed } from "./LiveFeed";
import { SquadPanel } from "./SquadPanel";
import { TopPlayersPanel } from "./TopPlayersPanel";
import { WheelHUD } from "./WheelHUD";
import { SpinButton } from "./SpinButton";
import { VoiceWidgetHUD } from "./VoiceWidget";
import { RecordingWidgetHUD } from "./RecordingWidget";
import { ActiveEffects } from "./ActiveEffects";
import { SkillDockHUD } from "./SkillDockHUD";

export type HudPhaseMode =
  | "loading"
  | "active"
  | "revive"
  | "championship"
  | "results";

interface SquadMemberData {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface GameplayHUDProps {
  phase?: number;
  totalPhases?: number;
  prizePoolCents?: number;
  phaseEndsAt?: number | null;
  tokens?: number;
  playerRank?: number;
  alivePlayers?: number;
  rankingPercentile?: number;
  surgePercent?: number;
  isSpinning?: boolean;
  spinLocked?: boolean;
  lastOutcome?: SpinOutcome | null;
  tokenAmount?: number;
  streak?: number;
  combo?: number;
  momentum?: number;
  recentOutcomes?: SpinOutcome[];
  onSpin?: () => void;
  onSpinComplete?: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
  hudPhase?: HudPhaseMode;
  connectionQuality?: "good" | "degraded" | "poor";
  isSynced?: boolean;
  soloMode?: boolean;
  currentUserId?: string;
  topPlayers?: { rank: number; username: string; tokens: number; userId?: string }[];
  squadMembers?: SquadMemberData[];
}

export function GameplayHUD({
  phase = 1,
  totalPhases = 6,
  prizePoolCents = 0,
  phaseEndsAt,
  tokens = 0,
  playerRank = 0,
  alivePlayers = 0,
  rankingPercentile = 0,
  surgePercent = 0,
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
  soloMode = false,
  currentUserId,
  topPlayers = [],
  squadMembers = [],
}: GameplayHUDProps) {
  const handleSpin = () => {
    if (spinLocked || isSpinning) return;
    onSpin?.();
  };

  return (
    <div data-gameplay="true" data-phase={hudPhase} className="gameplay-hud-root">
      {/* Background layers */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 55% at 50% 42%,rgba(88,28,135,0.24),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "radial-gradient(ellipse 100% 65% at 50% 100%,rgba(60,0,110,0.32),transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg,rgba(4,2,10,0.85),transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: "linear-gradient(0deg,rgba(4,2,10,0.97),transparent)" }} />
      </div>

      <div className="hud-safe-top" />

      <div className="zone-top-hud" style={{ position: "relative", zIndex: 10 }}>
        <TopHUD
          prizePoolCents={prizePoolCents}
          phase={phase}
          totalPhases={totalPhases}
          tokens={Math.round(tokens * 10) / 10}
          playerRank={playerRank}
          alivePlayers={alivePlayers}
          rankingPercentile={rankingPercentile}
          phaseEndsAt={phaseEndsAt}
          surgePercent={surgePercent}
          connectionQuality={connectionQuality}
          isSynced={isSynced}
        />
      </div>

      <div className="zone-wheel" style={{ position: "relative", zIndex: 5 }}>
        <div className="wheel-container">
          {/* Arena backdrop behind wheel */}
          <div
            className="arena-backdrop"
            style={{
              position: "absolute",
              inset: "8% 12%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(88,28,135,0.35) 0%, rgba(4,2,10,0.9) 70%)",
              border: "1px solid rgba(168,85,247,0.15)",
              boxShadow: "inset 0 0 80px rgba(88,28,135,0.3), 0 0 40px rgba(0,0,0,0.6)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          <div className="wheel-overlay-left overlay-panel">
            <LiveFeed />
          </div>

          <WheelHUD
            isSpinning={isSpinning}
            outcome={lastOutcome}
            tokenAmount={tokenAmount}
            onSpinComplete={onSpinComplete}
            onTokensAwarded={onTokensAwarded}
            onStealActivated={onStealActivated}
            streak={streak}
            combo={combo}
            momentum={momentum}
            recentOutcomes={recentOutcomes}
          />

          <div className="wheel-overlay-right overlay-panel">
            {soloMode ? (
              <TopPlayersPanel players={topPlayers} />
            ) : (
              <SquadPanel members={squadMembers} currentUserId={currentUserId} topPlayers={topPlayers} />
            )}
          </div>
        </div>
      </div>

      <div className="zone-engage" style={{ position: "relative", zIndex: 10 }}>
        <div className="engage-center">
          <VoiceWidgetHUD />
          <SpinButton disabled={isSpinning || spinLocked} isSpinning={isSpinning} onClick={handleSpin} />
          <RecordingWidgetHUD />
        </div>
      </div>

      <ActiveEffects />

      <SkillDockHUD />

      <div className="hud-safe-bottom" />
    </div>
  );
}
