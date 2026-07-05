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
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-[5px]">
        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", color: "#c084fc", textTransform: "uppercase", textShadow: "0 0 7px rgba(192,132,252,0.35)" }}>
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
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", color: "#f59e0b", textTransform: "uppercase", marginBottom: "4px" }}>
            YOUR SQUAD
          </span>

          <div className="flex flex-col gap-[4px] mb-[6px]">
            {YOUR_SQUAD.map((m) => (
              <div key={m.name} className="flex items-center gap-[5px]">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{ width: "20px", height: "20px", fontSize: "10px", background: m.isYou ? "linear-gradient(135deg,#7c3aed,#581c87)" : "linear-gradient(135deg,rgba(49,7,70,0.7),rgba(15,0,30,0.85))", border: m.isYou ? "1.5px solid #a855f7" : "1px solid rgba(168,85,247,0.25)", boxShadow: m.isYou ? "0 0 6px rgba(168,85,247,0.55)" : "none" }}
                >
                  {m.avatar}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <span style={{ fontSize: "9px", fontWeight: m.isYou ? 700 : 600, color: m.isYou ? "#fff" : "rgba(255,255,255,0.7)", lineHeight: 1 }}>
                      {m.name}{m.isYou && <span style={{ fontSize: "7px", color: "#a855f7", marginLeft: "2px" }}>You</span>}
                    </span>
                    <div className="flex items-center gap-[2px]">
                      <span style={{ fontSize: "8px", fontWeight: 700, color: m.hp > 50 ? "#c084fc" : m.hp > 25 ? "#f59e0b" : "#ef4444", fontVariantNumeric: "tabular-nums" }}>
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
                  <div className="rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(49,7,70,0.5)", border: "1px solid rgba(168,85,247,0.12)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.hp}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: m.hp > 50 ? "linear-gradient(90deg,#7c3aed,#a855f7)" : m.hp > 25 ? "linear-gradient(90deg,#92400e,#f59e0b)" : "linear-gradient(90deg,#7f1d1d,#ef4444)", boxShadow: m.hp > 50 ? "0 0 4px rgba(168,85,247,0.6)" : m.hp > 25 ? "0 0 4px rgba(245,158,11,0.6)" : "0 0 4px rgba(239,68,68,0.6)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.25),transparent)", marginBottom: "5px" }} />

          {/* TOP SQUADS */}
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", color: "#c084fc", textTransform: "uppercase", marginBottom: "4px" }}>
            TOP SQUADS
          </span>

          <div className="flex flex-col gap-[3px]">
            {TOP_SQUADS.map((sq) => (
              <div key={sq.rank} className="flex items-center gap-[4px]">
                <span style={{ fontSize: "9px", fontWeight: 700, color: sq.rank === 1 ? "#f59e0b" : "rgba(168,85,247,0.65)", width: "9px", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {sq.rank}
                </span>
                <span style={{ fontSize: "11px", flexShrink: 0 }}>{sq.avatar}</span>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.75)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sq.name}
                </span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#a855f7", fontVariantNumeric: "tabular-nums" }}>
                  {sq.percent}%
                </span>
              </div>
            ))}
          </div>

          {/* +24 More */}
          <button className="flex items-center gap-[3px] mt-[5px]">
            <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(168,85,247,0.65)", letterSpacing: "0.04em" }}>
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
