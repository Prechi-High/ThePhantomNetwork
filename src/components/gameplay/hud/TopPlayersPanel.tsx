"use client";

interface TopPlayer {
  rank: number;
  username: string;
  tokens: number;
  userId?: string;
}

const AVATARS = ["👻", "🦇", "🐺", "🔥", "⚡", "💀"];

function playerAvatar(id?: string, rank?: number): string {
  if (id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
    return AVATARS[Math.abs(h) % AVATARS.length];
  }
  return AVATARS[(rank ?? 1) % AVATARS.length];
}

/** Top players panel — solo / AI practice mode */
export function TopPlayersPanel({ players = [] }: { players?: TopPlayer[] }) {
  const display = players.length > 0 ? players : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", gap: 6 }}>
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.14em", color: "#f59e0b", textTransform: "uppercase", textShadow: "0 0 7px rgba(245,158,11,0.35)" }}>
        COMPETITORS
      </span>

      {display.length === 0 ? (
        <span style={{ fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.35)" }}>Loading players…</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {display.slice(0, 8).map((p) => {
            const maxTokens = Math.max(...display.map((x) => x.tokens), 1);
            const pct = Math.min(100, (p.tokens / maxTokens) * 100);
            return (
              <div
                key={p.userId ?? `${p.rank}-${p.username}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px",
                  borderRadius: 8,
                  background: p.rank <= 3 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                  border: p.rank === 1 ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(49,7,70,0.8)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                  {playerAvatar(p.userId, p.rank)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      #{p.rank} {p.username}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "#f59e0b", fontWeight: 700 }}>{p.tokens}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 9999, overflow: "hidden", background: "rgba(49,7,70,0.5)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#92400e,#f59e0b)", borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
