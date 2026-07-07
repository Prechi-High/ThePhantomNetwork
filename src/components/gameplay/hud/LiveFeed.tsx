"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useLiveFeedStore, type FeedEvent } from "@/stores/useLiveFeedStore";
import { useLiveFeedUpdates } from "@/hooks/useLiveFeedUpdates";

type EventType = "steal" | "revive" | "lead" | "phase" | "shield" | "surge" | "jackpot" | "cloak" | "multiplier" | "effect" | "elimination";

const EVENT_COLORS: Record<EventType, { accent: string; dot: string }> = {
  steal: { accent: "#ef4444", dot: "#ef4444" },
  revive: { accent: "#22c55e", dot: "#22c55e" },
  lead: { accent: "#f59e0b", dot: "#f59e0b" },
  phase: { accent: "#a855f7", dot: "#a855f7" },
  shield: { accent: "#38bdf8", dot: "#38bdf8" },
  surge: { accent: "#8b5cf6", dot: "#8b5cf6" },
  jackpot: { accent: "#fbbf24", dot: "#fbbf24" },
  cloak: { accent: "#818cf8", dot: "#818cf8" },
  multiplier: { accent: "#ec4899", dot: "#ec4899" },
  effect: { accent: "#38bdf8", dot: "#38bdf8" },
  elimination: { accent: "#ef4444", dot: "#ef4444" },
};

const VISIBLE = 5;

// Helper to format relative time
function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const eventTime = new Date(isoTimestamp).getTime();
  const diffMs = now - eventTime;

  if (diffMs < 1000) return "now";
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
  return `${Math.floor(diffMs / 3600000)}h`;
}

// Helper to format event text from backend data
function formatEventText(event: FeedEvent): string {
  const actor = event.actor?.username || "Player";
  const target = event.target?.username || "Target";
  const details = event.details || {};

  switch (event.type) {
    case "steal":
      return `${actor} stole ${details.amount ?? 0}`;
    case "revive":
      return `${actor} revived ${target}`;
    case "lead":
      return `${actor} takes 1st place`;
    case "phase":
      return `${details.phaseName ?? "Phase"} entered`;
    case "effect":
      return `${actor} activated ${details.effect ?? "Effect"}`;
    case "elimination":
      return `${actor} eliminated`;
    case "surge":
      return "Shadow Surge Activated";
    default:
      return `${actor} ${event.type}`;
  }
}

export function LiveFeed() {
  const { subSessionId } = useSessionStore();
  const events = useLiveFeedStore((s) => s.events);

  // Subscribe to live feed updates
  useLiveFeedUpdates(subSessionId);

  const displayedEvents = events.slice(0, VISIBLE);

  if (displayedEvents.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "clamp(6px, 0.8vw, 9px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(5px, 0.6vw, 7px)" }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: "clamp(5px, 0.6vw, 7px)",
              height: "clamp(5px, 0.6vw, 7px)",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.8)",
              flexShrink: 0,
            }}
          />
          <span
            className="text-xs"
            style={{
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#22c55e",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(34,197,94,0.45)",
            }}
          >
            LIVE FEED
          </span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
          Waiting for events...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "clamp(6px, 0.8vw, 9px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(5px, 0.6vw, 7px)" }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            width: "clamp(5px, 0.6vw, 7px)",
            height: "clamp(5px, 0.6vw, 7px)",
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.8)",
            flexShrink: 0,
          }}
        />
        <span
          className="text-xs"
          style={{
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "#22c55e",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(34,197,94,0.45)",
          }}
        >
          LIVE FEED
        </span>
      </div>

      {/* Activity Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.5vw, 6px)" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {displayedEvents.map((event) => {
            const eventType = (event.type as EventType) || "steal";
            const colors = EVENT_COLORS[eventType] || EVENT_COLORS.steal;
            const text = formatEventText(event);
            const time = formatRelativeTime(event.timestamp);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -10, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 0.8vw, 9px)",
                  paddingLeft: "clamp(5px, 0.6vw, 7px)",
                  borderLeft: `clamp(2px, 0.3vw, 3px) solid ${colors.accent}`,
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "clamp(4px, 0.5vw, 6px)",
                    height: "clamp(4px, 0.5vw, 6px)",
                    borderRadius: "50%",
                    background: colors.dot,
                    boxShadow: `0 0 4px ${colors.dot}`,
                    flexShrink: 0,
                  }}
                />

                {/* Text */}
                <span
                  className="text-sm"
                  style={{
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {text}
                </span>

                {/* Time */}
                <span
                  className="text-xs"
                  style={{
                    fontWeight: 600,
                    color: "rgba(168,85,247,0.5)",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {time}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View All */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(3px, 0.4vw, 5px)",
          padding: "clamp(4px, 0.5vw, 6px) 0",
          borderRadius: "clamp(6px, 0.8vw, 9px)",
          background: "rgba(168,85,247,0.08)",
          border: "1px solid rgba(168,85,247,0.2)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(168,85,247,0.15)";
          e.currentTarget.style.borderColor = "rgba(168,85,247,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(168,85,247,0.08)";
          e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)";
        }}
      >
        <span
          className="text-xs"
          style={{
            fontWeight: 700,
            color: "rgba(168,85,247,0.75)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          View All
        </span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
