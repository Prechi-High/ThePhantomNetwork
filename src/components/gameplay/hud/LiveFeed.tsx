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
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: "var(--space-1)" }}>
        <motion.div
          className="rounded-full"
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ 
            width: "clamp(5px,0.6vw,7px)", 
            height: "clamp(5px,0.6vw,7px)", 
            background: "#22c55e", 
            boxShadow: "0 0 5px #22c55e", 
            flexShrink: 0 
          }}
        />
        <span className="text-xs" style={{ fontWeight: 800, letterSpacing: "0.14em", color: "#22c55e", textTransform: "uppercase", textShadow: "0 0 7px rgba(34,197,94,0.45)" }}>
          LIVE FEED
        </span>
      </div>

      {/* 3 event slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px,0.3vw,4px)", minHeight: "clamp(90px,12vw,120px)" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                display: "flex",
                alignItems: "start",
                gap: "var(--space-1)",
                borderRadius: "clamp(6px,0.8vw,9px)",
                padding: "var(--space-1) clamp(5px,0.6vw,7px)",
                background: "rgba(10,4,22,0.45)",
                border: "1px solid rgba(168,85,247,0.14)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Avatar */}
              <div
                style={{ 
                  width: "clamp(16px,2.2vw,22px)", 
                  height: "clamp(16px,2.2vw,22px)", 
                  fontSize: "var(--text-md)", 
                  background: `linear-gradient(135deg,rgba(88,28,135,0.7),rgba(20,0,40,0.85))`, 
                  border: `1px solid ${ev.color}44`, 
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {ev.avatar}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px" }}>
                  <span className="text-sm" style={{ fontWeight: 700, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap" }}>
                    {ev.name}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 500, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>
                    {ev.action}
                  </span>
                  {ev.value && (
                    <span className="text-sm" style={{ fontWeight: 800, color: ev.color, lineHeight: 1.3, textShadow: `0 0 5px ${ev.color}60` }}>
                      {ev.value}
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ fontWeight: 500, color: "rgba(168,85,247,0.45)", lineHeight: 1 }}>
                  {ev.time}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All */}
      <button
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "clamp(2px,0.3vw,4px)", 
          marginTop: "var(--space-1)", 
          borderRadius: "clamp(6px,0.7vw,8px)", 
          padding: "var(--space-1) 0",
          background: "rgba(168,85,247,0.07)", 
          border: "1px solid rgba(168,85,247,0.16)" 
        }}
      >
        <span className="text-xs" style={{ fontWeight: 700, color: "rgba(168,85,247,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          View All
        </span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.65)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
