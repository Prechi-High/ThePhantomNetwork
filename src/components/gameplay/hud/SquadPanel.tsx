"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SquadMemberHUD {
  name: string;
  isYou?: boolean;
  hp: number;
  voiceActive?: boolean;
  avatar: string;
}

interface TopSquad {
  rank: number;
  name: string;
  avatar: string;
  percent: number;
}

const YOUR_SQUAD: SquadMemberHUD[] = [
  { name: "PhantomX", isYou: true, hp: 62, voiceActive: true,  avatar: "👻" },
  { name: "NovaQueen",              hp: 56, voiceActive: true,  avatar: "👸" },
  { name: "Ghost",                  hp: 45, voiceActive: false, avatar: "💀" },
  { name: "ShadowX",                hp: 30, voiceActive: false, avatar: "🌑" },
];

const TOP_SQUADS: TopSquad[] = [
  { rank: 1, name: "Camp Eclipse",  avatar: "🌑", percent: 62 },
  { rank: 2, name: "Nightfall",     avatar: "🌙", percent: 59 },
  { rank: 3, name: "Dark Legion",   avatar: "⚔️", percent: 46 },
  { rank: 4, name: "Phantom Force", avatar: "👻", percent: 38 },
];

export function SquadPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
        <span className="text-md" style={{ fontWeight: 800, letterSpacing: "0.12em", color: "#c084fc", textTransform: "uppercase", textShadow: "0 0 7px rgba(192,132,252,0.35)" }}>
          SQUADS
        </span>
        <button onClick={() => setExpanded((v) => !v)}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M6 9l6 6 6-6" stroke="rgba(168,85,247,0.65)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <>
          {/* YOUR SQUAD */}
          <span className="text-xs" style={{ fontWeight: 700, letterSpacing: "0.14em", color: "#f59e0b", textTransform: "uppercase", marginBottom: "var(--space-1)" }}>
            YOUR SQUAD
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBottom: "var(--space-2)" }}>
            {YOUR_SQUAD.map((m) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                {/* Avatar */}
                <div
                  style={{ 
                    width: "clamp(18px,2.4vw,24px)", 
                    height: "clamp(18px,2.4vw,24px)", 
                    fontSize: "var(--text-md)", 
                    background: m.isYou ? "linear-gradient(135deg,#7c3aed,#581c87)" : "linear-gradient(135deg,rgba(49,7,70,0.7),rgba(15,0,30,0.85))", 
                    border: m.isYou ? "1.5px solid #a855f7" : "1px solid rgba(168,85,247,0.25)", 
                    boxShadow: m.isYou ? "0 0 6px rgba(168,85,247,0.55)" : "none",
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {m.avatar}
                </div>

                {/* Name + bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span className="text-sm" style={{ fontWeight: m.isYou ? 700 : 600, color: m.isYou ? "#fff" : "rgba(255,255,255,0.7)", lineHeight: 1 }}>
                      {m.name}{m.isYou && <span className="text-xs" style={{ color: "#a855f7", marginLeft: "2px" }}>You</span>}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <span className="text-xs" style={{ fontWeight: 700, color: m.hp > 50 ? "#c084fc" : m.hp > 25 ? "#f59e0b" : "#ef4444", fontVariantNumeric: "tabular-nums" }}>
                        {m.hp}%
                      </span>
                      {m.voiceActive && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
                          <path d="M5 10v2a7 7 0 0014 0v-2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div style={{ borderRadius: "9999px", overflow: "hidden", height: "clamp(2px,0.3vw,3px)", background: "rgba(49,7,70,0.5)", border: "1px solid rgba(168,85,247,0.12)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.hp}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ 
                        height: "100%", 
                        borderRadius: "9999px",
                        background: m.hp > 50 ? "linear-gradient(90deg,#7c3aed,#a855f7)" : m.hp > 25 ? "linear-gradient(90deg,#92400e,#f59e0b)" : "linear-gradient(90deg,#7f1d1d,#ef4444)", 
                        boxShadow: m.hp > 50 ? "0 0 4px rgba(168,85,247,0.6)" : m.hp > 25 ? "0 0 4px rgba(245,158,11,0.6)" : "0 0 4px rgba(239,68,68,0.6)" 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.25),transparent)", marginBottom: "var(--space-1)" }} />

          {/* TOP SQUADS */}
          <span className="text-xs" style={{ fontWeight: 700, letterSpacing: "0.14em", color: "#c084fc", textTransform: "uppercase", marginBottom: "var(--space-1)" }}>
            TOP SQUADS
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px,0.3vw,4px)" }}>
            {TOP_SQUADS.map((sq) => (
              <div key={sq.rank} style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                <span className="text-sm" style={{ fontWeight: 700, color: sq.rank === 1 ? "#f59e0b" : "rgba(168,85,247,0.65)", width: "clamp(8px,1vw,10px)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {sq.rank}
                </span>
                <span style={{ fontSize: "var(--text-md)", flexShrink: 0 }}>{sq.avatar}</span>
                <span className="text-sm truncate" style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)", flex: 1, minWidth: 0 }}>
                  {sq.name}
                </span>
                <span className="text-sm" style={{ fontWeight: 700, color: "#a855f7", fontVariantNumeric: "tabular-nums" }}>
                  {sq.percent}%
                </span>
              </div>
            ))}
          </div>

          {/* +24 More */}
          <button style={{ display: "flex", alignItems: "center", gap: "clamp(2px,0.3vw,4px)", marginTop: "var(--space-1)" }}>
            <span className="text-sm" style={{ fontWeight: 700, color: "rgba(168,85,247,0.65)", letterSpacing: "0.04em" }}>
              +24 More
            </span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="rgba(168,85,247,0.55)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
