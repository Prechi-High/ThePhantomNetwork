"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SquadMemberHUD {
  name: string;
  isYou?: boolean;
  hp: number; // 0–100
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
  { name: "PhantomX", isYou: true, hp: 62, voiceActive: true, avatar: "👻" },
  { name: "NovaQueen", hp: 56, voiceActive: true, avatar: "👸" },
  { name: "Ghost", hp: 45, voiceActive: false, avatar: "💀" },
  { name: "ShadowX", hp: 30, voiceActive: false, avatar: "🌑" },
];

const TOP_SQUADS: TopSquad[] = [
  { rank: 1, name: "Camp Eclipse", avatar: "🌑", percent: 62 },
  { rank: 2, name: "Nightfall", avatar: "🌙", percent: 59 },
  { rank: 3, name: "Dark Legion", avatar: "⚔️", percent: 46 },
  { rank: 4, name: "Phantom Force", avatar: "👻", percent: 38 },
];

export function SquadPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="flex flex-col"
      style={{
        width: "100%",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[6px]">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#c084fc",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(192,132,252,0.4)",
          }}
        >
          SQUADS
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-[3px]"
        >
          <svg
            width="10" height="10"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M6 9l6 6 6-6" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <>
          {/* YOUR SQUAD label */}
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#f59e0b",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            YOUR SQUAD
          </span>

          {/* Squad members */}
          <div className="flex flex-col gap-[4px] mb-[8px]">
            {YOUR_SQUAD.map((member) => (
              <div key={member.name} className="flex items-center gap-[6px]">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center text-[11px]"
                  style={{
                    width: "24px",
                    height: "24px",
                    background: member.isYou
                      ? "linear-gradient(135deg,#7c3aed,#581c87)"
                      : "linear-gradient(135deg,rgba(49,7,70,0.8),rgba(20,0,35,0.9))",
                    border: member.isYou
                      ? "1.5px solid #a855f7"
                      : "1px solid rgba(168,85,247,0.3)",
                    boxShadow: member.isYou ? "0 0 8px rgba(168,85,247,0.6)" : "none",
                  }}
                >
                  {member.avatar}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: member.isYou ? 700 : 600,
                        color: member.isYou ? "#ffffff" : "rgba(255,255,255,0.75)",
                        lineHeight: 1,
                      }}
                    >
                      {member.name}
                      {member.isYou && (
                        <span
                          style={{
                            fontSize: "8px",
                            color: "#a855f7",
                            marginLeft: "3px",
                            fontWeight: 700,
                          }}
                        >
                          You
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-[3px]">
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          color: member.hp > 50 ? "#c084fc" : member.hp > 25 ? "#f59e0b" : "#ef4444",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {member.hp}%
                      </span>
                      {/* Voice indicator */}
                      {member.voiceActive && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="3" width="6" height="11" rx="3" fill="#22c55e" />
                          <path d="M5 10v2a7 7 0 0014 0v-2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="19" x2="12" y2="22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* HP bar */}
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      height: "4px",
                      background: "rgba(49,7,70,0.5)",
                      border: "1px solid rgba(168,85,247,0.15)",
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${member.hp}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{
                        background:
                          member.hp > 50
                            ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                            : member.hp > 25
                            ? "linear-gradient(90deg,#92400e,#f59e0b)"
                            : "linear-gradient(90deg,#7f1d1d,#ef4444)",
                        boxShadow:
                          member.hp > 50
                            ? "0 0 6px rgba(168,85,247,0.7)"
                            : member.hp > 25
                            ? "0 0 6px rgba(245,158,11,0.7)"
                            : "0 0 6px rgba(239,68,68,0.7)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)",
              marginBottom: "7px",
            }}
          />

          {/* TOP SQUADS label */}
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#c084fc",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            TOP SQUADS
          </span>

          {/* Top squads list */}
          <div className="flex flex-col gap-[3px]">
            {TOP_SQUADS.map((sq) => (
              <div key={sq.rank} className="flex items-center gap-[5px]">
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: sq.rank === 1 ? "#f59e0b" : "rgba(168,85,247,0.7)",
                    width: "10px",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sq.rank}
                </span>
                <span style={{ fontSize: "12px", flexShrink: 0 }}>{sq.avatar}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sq.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#a855f7",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sq.percent}%
                </span>
              </div>
            ))}
          </div>

          {/* +24 More */}
          <button
            className="flex items-center gap-[4px] mt-[6px]"
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(168,85,247,0.7)",
                letterSpacing: "0.04em",
              }}
            >
              +24 More
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="rgba(168,85,247,0.6)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
