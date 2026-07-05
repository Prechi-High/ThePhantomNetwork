"use client";

/**
 * GameplayHUD v2 — optimised spacing pass.
 * Key changes:
 *  - Live Feed + Squad Panel are absolute glass overlays on the wheel (not sidebar columns)
 *  - Bottom nav suppressed via data-gameplay attribute on root
 *  - Shadow Surge row merged with Rank to save vertical space
 *  - Voice + Recording are a compact horizontal strip
 *  - Everything scaled ~12% smaller than v1
 *  - Wheel remains the largest visual element
 */

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
    <div
      /* data-gameplay hides the bottom player nav via CSS in globals */
      data-gameplay="true"
      className="hud-root flex flex-col"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        background: "#06030f",
        fontFamily: "'Inter',system-ui,sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        zIndex: 50,
      }}
    >
      {/* ════════════════════════════════════
          BACKGROUND LAYERS
      ════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Central purple bloom */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 55% at 50% 42%,rgba(88,28,135,0.24) 0%,transparent 70%)" }} />
        {/* Floor reflection */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "radial-gradient(ellipse 100% 65% at 50% 100%,rgba(60,0,110,0.32) 0%,transparent 70%)" }} />
        {/* Subtle grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        {/* Top vignette */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(180deg,rgba(4,2,10,0.85) 0%,transparent 100%)" }} />
        {/* Bottom vignette */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "220px", background: "linear-gradient(0deg,rgba(4,2,10,0.97) 0%,transparent 100%)" }} />
      </div>

      {/* ── Safe area top ── */}
      <div style={{ height: "env(safe-area-inset-top,0px)", flexShrink: 0, zIndex: 1 }} />

      {/* ════════════════════════════════════
          TOP HUD  (4 cards in one row)
      ════════════════════════════════════ */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10 }}>
        <TopHUD
          prizePoolCents={prizePoolCents}
          phase={phase}
          totalPhases={totalPhases}
          tokens={Math.round(tokens * 10) / 10}
          playerRank={playerRank}
          alivePlayers={alivePlayers}
        />
      </div>

      {/* ════════════════════════════════════
          SHADOW SURGE  (label + rank + bar)
      ════════════════════════════════════ */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10 }}>
        <ShadowSurge percent={surgePercent} playerRank={playerRank} />
      </div>

      {/* ════════════════════════════════════
          WHEEL ZONE  — fills remaining space
          Live Feed & Squad float over it
      ════════════════════════════════════ */}
      <div
        className="relative flex-1 min-h-0 flex flex-col items-center justify-start"
        style={{ zIndex: 5 }}
      >
        {/* ── Wheel — centred, takes up natural space ── */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "100%", flex: "1 1 0", minHeight: 0 }}
        >
          {/* Scale wrapper so wheel never overflows */}
          <div
            style={{
              /* clamp wheel between 220 and 290px diameter */
              width: "min(76vw, 290px)",
              height: "min(76vw, 290px)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <WheelHUD
              isSpinning={spinning}
              outcome={lastOutcome}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          {/* ── Live Feed — absolute, left side, floats over wheel ── */}
          <div
            className="absolute left-[6px] top-[6px]"
            style={{
              width: "108px",
              maxHeight: "calc(100% - 12px)",
              zIndex: 20,
              background: "rgba(6,2,16,0.42)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              border: "1px solid rgba(168,85,247,0.22)",
              borderRadius: "14px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 12px rgba(168,85,247,0.08)",
              padding: "8px 7px",
              overflow: "hidden",
            }}
          >
            <LiveFeed />
          </div>

          {/* ── Squad Panel — absolute, right side, floats over wheel ── */}
          <div
            className="absolute right-[6px] top-[6px]"
            style={{
              width: "108px",
              maxHeight: "calc(100% - 12px)",
              zIndex: 20,
              background: "rgba(6,2,16,0.42)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              border: "1px solid rgba(168,85,247,0.22)",
              borderRadius: "14px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 12px rgba(168,85,247,0.08)",
              padding: "8px 7px",
              overflow: "hidden",
            }}
          >
            <SquadPanel />
          </div>
        </div>

        {/* ── Spin Button — sits just below wheel ── */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ marginTop: "-8px", paddingBottom: "4px" }}>
          <SpinButton
            disabled={spinning || spinLocked}
            onClick={handleSpin}
            isSpinning={spinning}
          />
        </div>
      </div>

      {/* ════════════════════════════════════
          VOICE + RECORDING  (compact strip)
      ════════════════════════════════════ */}
      <div
        className="relative flex-shrink-0 flex items-stretch gap-[6px] px-[8px] pb-[3px]"
        style={{ zIndex: 10 }}
      >
        <VoiceWidgetHUD />
        <RecordingWidgetHUD />
      </div>

      {/* ════════════════════════════════════
          ACTIVE EFFECTS
      ════════════════════════════════════ */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10 }}>
        <ActiveEffects />
      </div>

      {/* ════════════════════════════════════
          SKILLS DOCK  (fixed bottom)
      ════════════════════════════════════ */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10 }}>
        <SkillDockHUD />
      </div>

      {/* ── Safe area bottom ── */}
      <div style={{ height: "env(safe-area-inset-bottom,0px)", flexShrink: 0 }} />
    </div>
  );
}
