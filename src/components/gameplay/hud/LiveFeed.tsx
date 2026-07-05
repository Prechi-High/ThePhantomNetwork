"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FeedEvent {
  id: number;
  avatar: string;
  name: string;
  action: string;
  value?: string;
  time: string;
  color: string; // accent color
  icon: React.ReactNode;
}

const INITIAL_EVENTS: FeedEvent[] = [
  {
    id: 1,
    avatar: "👻",
    name: "NovaQueen",
    action: "stole",
    value: "2,250",
    time: "10s ago",
    color: "#a855f7",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: 2,
    avatar: "➕",
    name: "Ghost",
    action: "revived PhantomX",
    time: "20s ago",
    color: "#22c55e",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
        <path d="M12 8v8M8 12h8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    avatar: "🌑",
    name: "Camp Eclipse",
    action: "takes 1st",
    time: "30s ago",
    color: "#f59e0b",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 4,
    avatar: "🌑",
    name: "Nightfall",
    action: "enters Phase 2",
    time: "45s ago",
    color: "#a855f7",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: 5,
    avatar: "🛡️",
    name: "ShadowX",
    action: "activated Shield 🛡",
    time: "1m ago",
    color: "#38bdf8",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z" fill="#38bdf8" />
      </svg>
    ),
  },
  {
    id: 6,
    avatar: "⚡",
    name: "Steal Boost",
    action: "activated by PhantomX",
    time: "1m ago",
    color: "#a855f7",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" />
      </svg>
    ),
  },
];

export function LiveFeed() {
  const [events] = useState<FeedEvent[]>(INITIAL_EVENTS);

  return (
    <div
      className="flex flex-col"
      style={{
        width: "100%",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[6px]">
        <div className="flex items-center gap-[5px]">
          <motion.div
            className="rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: "7px", height: "7px", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#22c55e",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(34,197,94,0.5)",
            }}
          >
            LIVE FEED
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-[4px]">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-[6px] rounded-[9px] px-[7px] py-[5px]"
              style={{
                background: "rgba(10,4,22,0.75)",
                border: `1px solid rgba(168,85,247,0.18)`,
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Avatar circle */}
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center text-[11px]"
                style={{
                  width: "24px",
                  height: "24px",
                  background: `linear-gradient(135deg,rgba(88,28,135,0.8),rgba(30,0,50,0.9))`,
                  border: `1px solid ${ev.color}55`,
                  boxShadow: `0 0 6px ${ev.color}40`,
                }}
              >
                {ev.avatar}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-[3px] flex-wrap">
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {ev.name}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: 1.3,
                    }}
                  >
                    {ev.action}
                  </span>
                  {ev.value && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        color: ev.color,
                        lineHeight: 1.3,
                        textShadow: `0 0 6px ${ev.color}70`,
                      }}
                    >
                      {ev.value}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    color: "rgba(168,85,247,0.55)",
                    lineHeight: 1,
                  }}
                >
                  {ev.time}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All */}
      <button
        className="flex items-center gap-[4px] mt-[6px] rounded-[8px] px-[8px] py-[5px]"
        style={{
          background: "rgba(168,85,247,0.08)",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(168,85,247,0.8)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          View All
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
