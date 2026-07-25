"use client";

import { useSessionStore } from "@/stores/useSessionStore";

interface TopPlayer {
  rank: number;
  username: string;
  tokens: number;
  userId?: string;
}

/** Top players panel — replaces SquadPanel in solo mode */
export function TopPlayersPanel({ players = [] }: { players?: TopPlayer[] }) {
  const { subSessionId } = useSessionStore();

  const display =
    players.length > 0
      ? players
      : [
          { rank: 1, username: "—", tokens: 0 },
          { rank: 2, username: "—", tokens: 0 },
          { rank: 3, username: "—", tokens: 0 },
        ];

  return (
    <div className="top-players-panel" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8 }}>
      <span
        style={{
          fontSize: "var(--text-xs)",
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "#f59e0b",
          textTransform: "uppercase",
        }}
      >
        Top Players
      </span>
      {display.slice(0, 5).map((p) => (
        <div
          key={p.userId ?? `${p.rank}-${p.username}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 6px",
            borderRadius: 6,
            background: p.rank <= 3 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
            border: p.rank === 1 ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
          }}
        >
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff" }}>
            #{p.rank} {p.username}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "#f59e0b", fontWeight: 600 }}>
            {p.tokens}
          </span>
        </div>
      ))}
      {!subSessionId && (
        <span style={{ fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.3)" }}>
          Awaiting session…
        </span>
      )}
    </div>
  );
}
