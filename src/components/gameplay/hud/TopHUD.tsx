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
    <div className="top-hud-grid">
      {/* Prize Pool — 3 cols */}
      <div className="col-span-3 glass-panel top-card">
        <span
          className="top-card-label"
          style={{ color: "#22c55e" }}
        >
          PRIZE POOL
        </span>
        <span
          className="top-card-value"
          style={{
            color: "#22c55e",
            textShadow: "0 0 12px rgba(34,197,94,0.65)",
          }}
        >
          {prize}
        </span>
      </div>

      {/* Phase + Timer — 6 cols */}
      <div className="col-span-6 glass-panel top-card" style={{ alignItems: "center" }}>
        <span
          className="text-md"
          style={{
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "#c084fc",
            lineHeight: 1,
            marginBottom: "clamp(3px, 0.4vw, 5px)",
            textShadow: "0 0 8px rgba(192,132,252,0.5)",
            textTransform: "uppercase",
          }}
        >
          PHASE {phase}/{totalPhases}
        </span>

        {/* Phase dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(3px, 0.5vw, 5px)",
            marginBottom: "clamp(3px, 0.4vw, 5px)",
          }}
        >
          {Array.from({ length: totalPhases }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i + 1 === phase ? "clamp(16px, 2vw, 22px)" : "clamp(5px, 0.7vw, 7px)",
                height: "clamp(5px, 0.7vw, 7px)",
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
        <span
          className="text-3xl"
          style={{
            fontWeight: 900,
            letterSpacing: "0.05em",
            color: "#ffffff",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 16px rgba(255,255,255,0.25)",
          }}
        >
          02:45
        </span>
      </div>

      {/* Alive + Rank — 3 cols */}
      <div className="col-span-3 glass-panel top-card">
        {/* Alive */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "clamp(3px, 0.4vw, 5px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(2px, 0.3vw, 4px)", marginBottom: "1px" }}>
            <svg width="clamp(9px, 1.1vw, 12px)" height="clamp(9px, 1.1vw, 12px)" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" fill="rgba(168,85,247,0.75)" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(168,85,247,0.75)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span
              className="top-card-value"
              style={{ color: "#fff" }}
            >
              {alivePlayers}
            </span>
          </div>
          <span className="top-card-label" style={{ color: "rgba(168,85,247,0.75)" }}>
            ALIVE
          </span>
        </div>

        <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.35),transparent)", margin: "clamp(2px, 0.3vw, 4px) 0" }} />

        {/* Rank */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span className="top-card-label" style={{ color: "rgba(168,85,247,0.75)", marginBottom: "1px" }}>
            MY RANK
          </span>
          <span
            className="top-card-value"
            style={{
              color: "#c084fc",
              textShadow: "0 0 10px rgba(192,132,252,0.55)",
            }}
          >
            {playerRank}{rankSuffix}
          </span>
        </div>
      </div>
    </div>
  );
}
