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

  const cardBase: React.CSSProperties = {
    background: "rgba(10,4,22,0.55)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(168,85,247,0.28)",
    boxShadow: "0 0 14px rgba(168,85,247,0.1), inset 0 1px 0 rgba(168,85,247,0.1)",
    borderRadius: "12px",
  };

  return (
    <div className="flex items-stretch gap-[5px] px-[8px] pt-[8px] pb-[3px]">

      {/* ── Prize Pool ── */}
      <div
        className="flex flex-col justify-center px-[9px] py-[6px] min-w-0"
        style={{ ...cardBase, flex: "1 1 0" }}
      >
        <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", color: "#22c55e", textTransform: "uppercase", lineHeight: 1, marginBottom: "2px" }}>
          PRIZE POOL
        </span>
        <span style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-0.01em", color: "#22c55e", lineHeight: 1, textShadow: "0 0 12px rgba(34,197,94,0.65)", fontVariantNumeric: "tabular-nums" }}>
          {prize}
        </span>
      </div>

      {/* ── Phase + Timer (center) ── */}
      <div
        className="flex flex-col items-center justify-center px-[6px] py-[5px]"
        style={{ ...cardBase, flex: "1.5 1 0" }}
      >
        <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "#c084fc", lineHeight: 1, marginBottom: "3px", textShadow: "0 0 8px rgba(192,132,252,0.5)", textTransform: "uppercase" }}>
          PHASE {phase}/{totalPhases}
        </span>

        {/* Progress dots */}
        <div className="flex items-center gap-[4px] mb-[3px]">
          {Array.from({ length: totalPhases }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i + 1 === phase ? "18px" : "6px",
                height: "6px",
                background:
                  i + 1 < phase
                    ? "#7c3aed"
                    : i + 1 === phase
                    ? "linear-gradient(90deg,#a855f7,#c084fc)"
                    : "rgba(168,85,247,0.18)",
                boxShadow: i + 1 === phase ? "0 0 7px rgba(168,85,247,0.8)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "0.05em", color: "#ffffff", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 16px rgba(255,255,255,0.25)" }}>
          02:45
        </span>
      </div>

      {/* ── Alive + Rank ── */}
      <div
        className="flex flex-col items-center justify-between px-[9px] py-[6px]"
        style={{ ...cardBase, flex: "1 1 0" }}
      >
        {/* Alive */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-[3px] mb-[1px]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" fill="rgba(168,85,247,0.75)" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(168,85,247,0.75)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "18px", fontWeight: 900, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {alivePlayers}
            </span>
          </div>
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(168,85,247,0.75)", textTransform: "uppercase", lineHeight: 1 }}>
            ALIVE
          </span>
        </div>

        <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.35),transparent)" }} />

        {/* Rank */}
        <div className="flex flex-col items-center">
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(168,85,247,0.75)", textTransform: "uppercase", lineHeight: 1, marginBottom: "1px" }}>
            MY RANK
          </span>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#c084fc", lineHeight: 1, textShadow: "0 0 10px rgba(192,132,252,0.55)", fontVariantNumeric: "tabular-nums" }}>
            {playerRank}{rankSuffix}
          </span>
        </div>
      </div>

      {/* ── My Tokens ── */}
      <div
        className="flex flex-col justify-center px-[9px] py-[6px] min-w-0"
        style={{ ...cardBase, flex: "1 1 0" }}
      >
        <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(168,85,247,0.6)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2px" }}>
          MY TOKENS
        </span>
        <div className="flex items-center gap-[4px]">
          {/* gem icon */}
          <div className="flex-shrink-0 rounded-full flex items-center justify-center" style={{ width: "16px", height: "16px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 6px rgba(168,85,247,0.55)" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
            {tokens}
          </span>
        </div>
        <span style={{ fontSize: "8px", fontWeight: 600, color: "rgba(168,85,247,0.5)", letterSpacing: "0.02em", marginTop: "2px", lineHeight: 1 }}>
          TOP 18%
        </span>
      </div>

    </div>
  );
}
