"use client";

import { motion } from "framer-motion";

interface TopHUDProps {
  prizePoolCents: number;
  phase: number;
  totalPhases: number;
  tokens: number;
  playerRank: number;
  alivePlayers: number;
}

export function TopHUD({
  prizePoolCents,
  phase,
  totalPhases,
  tokens,
  playerRank,
  alivePlayers,
}: TopHUDProps) {
  const prize = `$${(prizePoolCents / 100).toLocaleString()}`;
  const rankSuffix =
    playerRank === 1 ? "st" : playerRank === 2 ? "nd" : playerRank === 3 ? "rd" : "th";

  return (
    <div className="hud-top-row flex items-stretch gap-[6px] px-[10px] pt-[10px] pb-[4px]">
      {/* Prize Pool */}
      <div
        className="hud-card-prize flex flex-col justify-center px-[10px] py-[8px] rounded-[14px] min-w-0"
        style={{
          background: "linear-gradient(135deg,rgba(10,4,20,0.92) 0%,rgba(20,6,35,0.88) 100%)",
          border: "1px solid rgba(168,85,247,0.35)",
          boxShadow: "0 0 18px rgba(168,85,247,0.15), inset 0 1px 0 rgba(168,85,247,0.12)",
          flex: "1.1",
        }}
      >
        <span
          className="uppercase"
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#22c55e",
            lineHeight: 1,
            marginBottom: "3px",
          }}
        >
          PRIZE POOL
        </span>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "-0.01em",
            color: "#22c55e",
            lineHeight: 1,
            textShadow: "0 0 14px rgba(34,197,94,0.7)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {prize}
        </span>
      </div>

      {/* Phase + Timer (center) */}
      <div
        className="hud-card-phase flex flex-col items-center justify-center px-[8px] py-[6px] rounded-[14px]"
        style={{
          background: "linear-gradient(135deg,rgba(10,4,22,0.9) 0%,rgba(18,6,38,0.88) 100%)",
          border: "1px solid rgba(168,85,247,0.35)",
          boxShadow: "0 0 18px rgba(168,85,247,0.15), inset 0 1px 0 rgba(168,85,247,0.1)",
          flex: "1.4",
        }}
      >
        {/* Phase label */}
        <span
          className="uppercase"
          style={{
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#c084fc",
            lineHeight: 1,
            marginBottom: "2px",
            textShadow: "0 0 10px rgba(192,132,252,0.5)",
          }}
        >
          PHASE {phase}/{totalPhases}
        </span>
        {/* Phase dots */}
        <div className="flex items-center gap-[5px] mb-[4px]">
          {Array.from({ length: totalPhases }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i + 1 === phase ? "22px" : "7px",
                height: "7px",
                background:
                  i + 1 < phase
                    ? "#7c3aed"
                    : i + 1 === phase
                    ? "linear-gradient(90deg,#a855f7,#c084fc)"
                    : "rgba(168,85,247,0.2)",
                boxShadow: i + 1 === phase ? "0 0 8px rgba(168,85,247,0.8)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        {/* Timer */}
        <span
          style={{
            fontSize: "34px",
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "#ffffff",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        >
          02:45
        </span>
      </div>

      {/* Alive + Rank (right) */}
      <div
        className="hud-card-stats flex flex-col items-center justify-between px-[10px] py-[8px] rounded-[14px]"
        style={{
          background: "linear-gradient(135deg,rgba(10,4,20,0.92) 0%,rgba(20,6,35,0.88) 100%)",
          border: "1px solid rgba(168,85,247,0.35)",
          boxShadow: "0 0 18px rgba(168,85,247,0.15), inset 0 1px 0 rgba(168,85,247,0.12)",
          flex: "0.9",
        }}
      >
        {/* Alive */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-[4px] mb-[1px]">
            {/* person icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" fill="rgba(168,85,247,0.8)" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(168,85,247,0.8)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {alivePlayers}
            </span>
          </div>
          <span
            className="uppercase"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "rgba(168,85,247,0.8)",
              lineHeight: 1,
            }}
          >
            ALIVE
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)",
          }}
        />

        {/* Rank */}
        <div className="flex flex-col items-center">
          <span
            className="uppercase"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(168,85,247,0.8)",
              lineHeight: 1,
              marginBottom: "1px",
            }}
          >
            MY RANK
          </span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#c084fc",
              lineHeight: 1,
              textShadow: "0 0 12px rgba(192,132,252,0.6)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {playerRank}{rankSuffix}
          </span>
        </div>
      </div>
    </div>
  );
}
