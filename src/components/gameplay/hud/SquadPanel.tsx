"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SquadMemberData {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface TopPlayerEntry {
  rank: number;
  username: string;
  tokens: number;
}

interface SquadPanelProps {
  members?: SquadMemberData[];
  currentUserId?: string;
  topPlayers?: TopPlayerEntry[];
}

const AVATARS = ["👻", "🌟", "🦇", "💀", "⚡", "🔥"];

function memberAvatar(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATARS[Math.abs(h) % AVATARS.length];
}

function MemberRow({
  name,
  tokens,
  isYou,
  isEliminated,
  isRevivable,
  avatar,
}: {
  name: string;
  tokens: number;
  isYou?: boolean;
  isEliminated?: boolean;
  isRevivable?: boolean;
  avatar: string;
}) {
  const maxTokens = Math.max(tokens, 20);
  const pct = Math.min(100, (tokens / maxTokens) * 100);
  const barColor = isEliminated ? "#374151" : pct > 50 ? "#7c3aed" : pct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="squad-member-row" style={{ opacity: isEliminated ? 0.45 : 1 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: isYou ? "linear-gradient(135deg,#7c3aed,#581c87)" : "rgba(49,7,70,0.8)", border: isYou ? "1.5px solid #a855f7" : "1px solid rgba(168,85,247,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
        {avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: isYou ? 700 : 600, color: isEliminated ? "rgba(255,255,255,0.35)" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}{isYou ? " (YOU)" : ""}
          </span>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: isEliminated ? "rgba(255,255,255,0.3)" : barColor }}>
            {isEliminated ? (isRevivable ? "↩" : "✕") : tokens}
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 9999, overflow: "hidden", background: "rgba(49,7,70,0.5)" }}>
          <motion.div animate={{ width: isEliminated ? "0%" : `${pct}%` }} style={{ height: "100%", background: barColor, borderRadius: 9999 }} />
        </div>
      </div>
    </div>
  );
}

export function SquadPanel({ members = [], currentUserId, topPlayers = [] }: SquadPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const squadRows = members.map((m) => ({
    id: m.user_id,
    name: m.profiles?.username ?? "Player",
    tokens: Number(m.session_tokens),
    isYou: m.user_id === currentUserId,
    isEliminated: m.is_eliminated,
    isRevivable: m.is_revivable,
    avatar: memberAvatar(m.user_id),
  }));

  const aliveCount = squadRows.filter((m) => !m.isEliminated).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.14em", color: "#c084fc", textTransform: "uppercase" }}>
            YOUR SQUAD
          </span>
          {squadRows.length > 0 && (
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "#a855f7", padding: "1px 5px", borderRadius: 9999, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
              {aliveCount}/{squadRows.length}
            </span>
          )}
        </div>
        <button onClick={() => setExpanded((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(168,85,247,0.65)", fontSize: 10 }}>
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            {squadRows.length === 0 ? (
              <span style={{ fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.35)" }}>No squad data yet</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {squadRows.map((m) => (
                  <MemberRow key={m.id} name={m.name} tokens={m.tokens} isYou={m.isYou} isEliminated={m.isEliminated} isRevivable={m.isRevivable} avatar={m.avatar} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {topPlayers.length > 0 && (
        <div style={{ marginTop: 4, flex: 1, overflow: "hidden" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.14em", color: "#f59e0b", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            TOP PLAYERS
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {topPlayers.slice(0, 4).map((p) => (
              <div key={`${p.rank}-${p.username}`} style={{ display: "flex", justifyContent: "space-between", padding: "3px 5px", borderRadius: 6, background: p.rank === 1 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff" }}>#{p.rank} {p.username}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "#f59e0b", fontWeight: 600 }}>{p.tokens}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
