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
        <span className="top-card-label" style={{ color: "#22c55e" }}>
          PRIZE POOL
        </span>
        <motion.span
          className="top-card-value"
          key={prizePoolCents}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            color: "#22c55e",
            textShadow: "0 0 12px rgba(34,197,94,0.65)",
          }}
        >
          ${prize}
        </motion.span>
      </div>

      {/* Phase + Timer — 3 cols */}
      <div className="col-span-3 glass-panel top-card" style={{ alignItems: "center" }}>
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
              initial={false}
              animate={{
                width: i + 1 === phase ? "clamp(16px, 2vw, 22px)" : "clamp(5px, 0.7vw, 7px)",
                background:
                  i + 1 < phase
                    ? "#7c3aed"
                    : i + 1 === phase
                    ? "linear-gradient(90deg,#a855f7,#c084fc)"
                    : "rgba(168,85,247,0.18)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                height: "clamp(5px, 0.7vw, 7px)",
                boxShadow: i + 1 === phase ? "0 0 7px rgba(168,85,247,0.8)" : "none",
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <motion.span
          className="text-3xl"
          key={Math.floor(Date.now() / 1000)}
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
        </motion.span>
      </div>

      {/* MY TOKENS — 3 cols */}
      <div className="col-span-3 glass-panel top-card" style={{ alignItems: "center" }}>
        <span className="top-card-label" style={{ color: "rgba(168,85,247,0.75)", marginBottom: "clamp(2px, 0.3vw, 3px)" }}>
          MY TOKENS
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)", marginBottom: "clamp(2px, 0.3vw, 3px)" }}>
          <svg width="clamp(14px, 1.8vw, 18px)" height="clamp(14px, 1.8vw, 18px)" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="url(#tokenGrad)" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M12 8v8M8 12h8" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="tokenGrad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fcd34d" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <motion.span
            className="top-card-value"
            key={tokens}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              color: "#fbbf24",
              textShadow: "0 0 12px rgba(251,191,36,0.65)",
            }}
          >
            {tokens}
          </motion.span>
        </div>
        <span className="text-xs" style={{ fontWeight: 700, color: "rgba(251,191,36,0.55)", lineHeight: 1 }}>
          Ranking: Top 18%
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
            <motion.span
              className="top-card-value"
              key={alivePlayers}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ color: "#fff" }}
            >
              {alivePlayers}
            </motion.span>
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
          <motion.span
            className="top-card-value"
            key={playerRank}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              color: "#c084fc",
              textShadow: "0 0 10px rgba(192,132,252,0.55)",
            }}
          >
            {playerRank}{rankSuffix}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
