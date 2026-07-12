"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useLiveFeedStore, type FeedEvent } from "@/stores/useLiveFeedStore";
import { useLiveFeedUpdates } from "@/hooks/useLiveFeedUpdates";

interface EventStyle {
  accent: string;
  dot: string;
  icon: string;
  priority: "high" | "normal" | "low";
}

const EVENT_STYLES: Record<string, EventStyle> = {
  steal:       { accent: "#ef4444", dot: "#ef4444", icon: "⚡", priority: "high" },
  revive:      { accent: "#22c55e", dot: "#22c55e", icon: "💚", priority: "high" },
  lead:        { accent: "#f59e0b", dot: "#f59e0b", icon: "👑", priority: "high" },
  phase:       { accent: "#a855f7", dot: "#a855f7", icon: "🔮", priority: "high" },
  effect:      { accent: "#38bdf8", dot: "#38bdf8", icon: "✨", priority: "low" },
  elimination: { accent: "#ef4444", dot: "#ef4444", icon: "💀", priority: "high" },
  surge:       { accent: "#8b5cf6", dot: "#8b5cf6", icon: "⚡", priority: "high" },
};
const DEFAULT_STYLE: EventStyle = { accent: "#a855f7", dot: "#a855f7", icon: "•", priority: "normal" };

const VISIBLE = 6;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 1000)    return "now";
  if (diff < 60_000)  return `${Math.floor(diff / 1000)}s`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  return `${Math.floor(diff / 3600_000)}h`;
}

function buildStory(event: FeedEvent): string {
  const a = event.actor?.username   || "Someone";
  const t = event.target?.username  || "a player";
  const d = event.details           || {};

  switch (event.type) {
    case "steal":
      return `${a} stole ${d.amount ?? "tokens"} from ${t}`;
    case "revive":
      return `${a} revived ${t} — back in the fight`;
    case "lead":
      return `${a} takes 1st place`;
    case "phase":
      return `${(d.phaseName as string) ?? "New phase"} has started`;
    case "effect":
      return `${a} activated ${(d.effect as string) ?? "Effect"}`;
    case "elimination":
      return `${a} was eliminated`;
    case "surge":
      return "Shadow Surge activated — all bets up";
    default:
      return `${a} made a move`;
  }
}

/** Pinned high-priority banner that appears briefly then dissolves */
function PriorityBanner({ event, style }: { event: FeedEvent; style: EventStyle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(5px, 0.6vw, 7px)",
        padding: "clamp(4px, 0.5vw, 6px) clamp(7px, 0.9vw, 10px)",
        borderRadius: "clamp(6px, 0.9vw, 9px)",
        background: `${style.accent}18`,
        border: `1px solid ${style.accent}55`,
        marginBottom: "clamp(3px, 0.4vw, 5px)",
        boxShadow: `0 0 10px ${style.accent}22`,
      }}
    >
      <span style={{ fontSize: "var(--text-md)", flexShrink: 0 }}>{style.icon}</span>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: style.accent, flex: 1, lineHeight: 1.3 }}>
        {buildStory(event)}
      </span>
    </motion.div>
  );
}

export function LiveFeed() {
  const { subSessionId } = useSessionStore();
  const events = useLiveFeedStore((s) => s.events);
  useLiveFeedUpdates(subSessionId);

  const displayed = events.slice(0, VISIBLE);
  const pinned    = displayed.filter(e => (EVENT_STYLES[e.type]?.priority ?? "normal") === "high").slice(0, 1);
  const stream    = displayed.filter(e => !pinned.find(p => p.id === e.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", gap: "clamp(4px, 0.5vw, 6px)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.5vw, 6px)", flexShrink: 0 }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: "clamp(5px, 0.6vw, 7px)", height: "clamp(5px, 0.6vw, 7px)", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px rgba(34,197,94,0.9)", flexShrink: 0 }}
        />
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.16em", color: "#22c55e", textTransform: "uppercase", textShadow: "0 0 8px rgba(34,197,94,0.45)" }}>
          LIVE
        </span>
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "rgba(34,197,94,0.5)", marginLeft: "auto" }}>
          {events.length} events
        </span>
      </div>

      {/* Priority banner */}
      <AnimatePresence mode="popLayout">
        {pinned.map(e => (
          <PriorityBanner key={e.id} event={e} style={EVENT_STYLES[e.type] ?? DEFAULT_STYLE} />
        ))}
      </AnimatePresence>

      {/* Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(3px, 0.4vw, 5px)", flex: 1, overflow: "hidden" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {stream.length === 0 && events.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "var(--text-xs)", padding: "clamp(3px, 0.4vw, 5px) 0" }}
            >
              Watching for activity…
            </motion.div>
          ) : (
            stream.map((event) => {
              const s = EVENT_STYLES[event.type] ?? DEFAULT_STYLE;
              const story = buildStory(event);
              const time = relativeTime(event.timestamp);

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="feed-event"
                  style={{ borderLeft: `2px solid ${s.accent}` }}
                >
                  {/* Dot */}
                  <div style={{ width: "clamp(4px, 0.5vw, 6px)", height: "clamp(4px, 0.5vw, 6px)", borderRadius: "50%", background: s.dot, boxShadow: `0 0 4px ${s.dot}`, flexShrink: 0 }} />

                  {/* Story */}
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.82)", flex: 1, lineHeight: 1.35 }}>
                    {story}
                  </span>

                  {/* Time */}
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "rgba(168,85,247,0.5)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {time}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
