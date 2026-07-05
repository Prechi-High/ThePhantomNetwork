"use client";

/**
 * GameplayHUD — pixel-perfect recreation of the reference design.
 * Mobile-first, 390×844 viewport target.
 * Single-screen: no scrolling, everything visible.
 */

import { useState } from "react";
import { motion } from "framer-motion";
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
    /* Root: full viewport, no overflow, dark background */
    <div
      className="hud-root relative overflow-hidden flex flex-col"
      style={{
        width: "100%",
        height: "100dvh",
        maxHeight: "100dvh",
        background: "#06030f",
        fontFamily: "'Inter',system-ui,sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep radial purple center */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%,rgba(88,28,135,0.22) 0%,transparent 70%)",
          }}
        />
        {/* Arena floor reflection */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45%",
            background:
              "radial-gradient(ellipse 100% 60% at 50% 100%,rgba(68,0,120,0.35) 0%,transparent 70%)",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),
              linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />
        {/* Top vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(180deg,rgba(4,2,10,0.8) 0%,transparent 100%)",
          }}
        />
        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(0deg,rgba(4,2,10,0.95) 0%,transparent 100%)",
          }}
        />
      </div>

      {/* ── Safe area top spacer ── */}
      <div style={{ height: "env(safe-area-inset-top,0px)", flexShrink: 0 }} />

      {/* ══════════════ TOP HUD ══════════════ */}
      <div className="relative z-10 flex-shrink-0">
        <TopHUD
          prizePoolCents={prizePoolCents}
          phase={phase}
          totalPhases={totalPhases}
          tokens={Math.round(tokens)}
          playerRank={playerRank}
          alivePlayers={alivePlayers}
        />
      </div>

      {/* ══════════════ TOKENS ROW ══════════════ */}
      <div className="relative z-10 flex-shrink-0 flex items-center gap-[8px] px-[10px] py-[3px]">
        <div className="flex items-center gap-[5px]">
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "rgba(168,85,247,0.65)",
              textTransform: "uppercase",
            }}
          >
            MY TOKENS
          </span>
        </div>
        <div className="flex items-center gap-[5px]">
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: "18px",
              height: "18px",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              boxShadow: "0 0 7px rgba(168,85,247,0.6)",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {tokens}
          </span>
        </div>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "rgba(168,85,247,0.6)",
            letterSpacing: "0.04em",
          }}
        >
          RANKING: TOP 18%
        </span>
      </div>

      {/* ══════════════ SHADOW SURGE ══════════════ */}
      <div className="relative z-10 flex-shrink-0">
        <ShadowSurge percent={surgePercent} />
      </div>

      {/* ══════════════ MIDDLE ZONE ══════════════ */}
      {/* Live Feed | Wheel | Squad Panel — flex row */}
      <div className="relative z-10 flex flex-row flex-1 min-h-0 px-[6px] gap-[4px] items-stretch">
        {/* ── Left: Live Feed ── */}
        <div
          className="flex flex-col justify-start overflow-hidden"
          style={{ width: "108px", flexShrink: 0, paddingTop: "6px" }}
        >
          <div
            className="rounded-[14px] p-[7px] h-full"
            style={{
              background: "rgba(8,3,18,0.78)",
              border: "1px solid rgba(168,85,247,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <LiveFeed />
          </div>
        </div>

        {/* ── Center: Wheel + Spin Button ── */}
        <div className="flex-1 flex flex-col items-center justify-between min-w-0 py-[4px]">
          {/* Wheel */}
          <div className="flex items-center justify-center flex-1">
            <WheelHUD
              isSpinning={spinning}
              outcome={lastOutcome}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          {/* Spin button — below wheel, overlaps bottom slightly */}
          <div className="flex-shrink-0 -mt-[10px]">
            <SpinButton
              disabled={spinning || spinLocked}
              onClick={handleSpin}
              isSpinning={spinning}
            />
          </div>
        </div>

        {/* ── Right: Squad Panel ── */}
        <div
          className="flex flex-col justify-start overflow-hidden"
          style={{ width: "108px", flexShrink: 0, paddingTop: "6px" }}
        >
          <div
            className="rounded-[14px] p-[7px] h-full"
            style={{
              background: "rgba(8,3,18,0.78)",
              border: "1px solid rgba(168,85,247,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <SquadPanel />
          </div>
        </div>
      </div>

      {/* ══════════════ VOICE + RECORDING ROW ══════════════ */}
      <div className="relative z-10 flex-shrink-0 flex items-stretch justify-between px-[10px] gap-[8px] py-[4px]">
        <VoiceWidgetHUD />
        <RecordingWidgetHUD />
      </div>

      {/* ══════════════ ACTIVE EFFECTS ══════════════ */}
      <div className="relative z-10 flex-shrink-0 py-[4px]">
        <ActiveEffects />
      </div>

      {/* ══════════════ SKILLS DOCK ══════════════ */}
      <div className="relative z-10 flex-shrink-0">
        <SkillDockHUD />
      </div>

      {/* ── Safe area bottom ── */}
      <div style={{ height: "env(safe-area-inset-bottom,0px)", flexShrink: 0 }} />
    </div>
  );
}
