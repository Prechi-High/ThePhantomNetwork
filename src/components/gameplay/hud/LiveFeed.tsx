"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface FeedEvent {
  id: number;
  avatar: string;
  name: string;
  action: string;
  value?: string;
  time: string;
  color: string;
}

const EVENT_POOL: FeedEvent[] = [
  { id: 1, avatar: "👻", name: "NovaQueen",  action: "stole",              value: "2,250", time: "10s", color: "#a855f7" },
  { id: 2, avatar: "➕", name: "Ghost",      action: "revived PhantomX",               time: "20s", color: "#22c55e" },
  { id: 3, avatar: "🌑", name: "Camp Eclipse", action: "takes 1st",                   time: "30s", color: "#f59e0b" },
  { id: 4, avatar: "🌑", name: "Nightfall",  action: "enters Phase 2",                time: "45s", color: "#a855f7" },
  { id: 5, avatar: "🛡️", name: "ShadowX",    action: "activated Shield",              time: "1m",  color: "#38bdf8" },
  { id: 6, avatar: "⚡", name: "PhantomX",   action: "activated Steal Boost",         time: "1m",  color: "#a855f7" },
];

// Display only 3 events — oldest exits upward, new one enters from below
const VISIBLE = 3;

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(EVENT_POOL.slice(0, VISIBLE));
  const nextIdRef = useRef(EVENT_POOL.length + 1);

  // Simulate a new event every 4s for the "alive" feel
  useEffect(() => {
    const timer = setInterval(() => {
      const pool = EVENT_POOL;
      const next: FeedEvent = {
        ...pool[Math.floor(Math.random() * pool.length)],
        id: nextIdRef.current++,
        time: "now",
      };
      setEvents((prev) => [...prev.slice(-(VISIBLE - 1)), next]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center gap-[4px] mb-[5px]">
        <motion.div
          className="rounded-full"
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: "6px", height: "6px", background: "#22c55e", boxShadow: "0 0 5px #22c55e", flexShrink: 0 }}
        />
        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.14em", color: "#22c55e", textTransform: "uppercase", textShadow: "0 0 7px rgba(34,197,94,0.45)" }}>
          LIVE FEED
        </span>
      </div>

      {/* 3 event slots */}
      <div className="flex flex-col gap-[3px]" style={{ minHeight: "108px" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-start gap-[5px] rounded-[8px] px-[6px] py-[4px]"
              style={{
                background: "rgba(10,4,22,0.45)",
                border: "1px solid rgba(168,85,247,0.14)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{ width: "20px", height: "20px", fontSize: "10px", background: `linear-gradient(135deg,rgba(88,28,135,0.7),rgba(20,0,40,0.85))`, border: `1px solid ${ev.color}44`, flexShrink: 0 }}
              >
                {ev.avatar}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-[2px]">
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap" }}>
                    {ev.name}
                  </span>
                  <span style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>
                    {ev.action}
                  </span>
                  {ev.value && (
                    <span style={{ fontSize: "9px", fontWeight: 800, color: ev.color, lineHeight: 1.3, textShadow: `0 0 5px ${ev.color}60` }}>
                      {ev.value}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "8px", fontWeight: 500, color: "rgba(168,85,247,0.45)", lineHeight: 1 }}>
                  {ev.time}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All */}
      <button
        className="flex items-center justify-center gap-[3px] mt-[5px] rounded-[7px] py-[4px]"
        style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.16)" }}
      >
        <span style={{ fontSize: "8.5px", fontWeight: 700, color: "rgba(168,85,247,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          View All
        </span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.65)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
