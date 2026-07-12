"use client";

/**
 * WorldActivityTicker — HUD World Presence Widget
 *
 * A subtle, always-visible strip that makes the world feel alive.
 * Cycles through live world signals every few seconds.
 * Never distracting. Always present.
 *
 * Signals:
 *   - Players online
 *   - Active sessions
 *   - Recent steals
 *   - Camp momentum leader
 *   - Active world event
 *   - Community activity
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorldStore }   from "@/stores/useWorldStore";
import type { WorldStats } from "@/lib/world/worldTimeline";
import type { CampMomentumEntry } from "@/lib/world/campMomentum";
import type { WorldEvent }        from "@/lib/world/worldEvents";

const CYCLE_MS = 4_000;

interface TickerItem {
  icon: string;
  text: string;
  accent: string;
}

function buildTickerItems(
  stats: WorldStats | null,
  camps: CampMomentumEntry[],
  activeEvent: WorldEvent | null,
): TickerItem[] {
  if (!stats) return [];

  const items: TickerItem[] = [];

  if (stats.playersOnline > 0) {
    items.push({ icon: "◉", text: `${stats.playersOnline.toLocaleString()} online`, accent: "#22c55e" });
  }
  if (stats.activeSessions > 0) {
    items.push({ icon: "▦", text: `${stats.activeSessions} active sessions`, accent: "#a855f7" });
  }
  if (stats.recentSteals > 0) {
    items.push({ icon: "⚡", text: `${stats.recentSteals} steals this hour`, accent: "#ef4444" });
  }
  if (stats.revivesToday > 0) {
    items.push({ icon: "💚", text: `${stats.revivesToday} revives today`, accent: "#22c55e" });
  }
  if (stats.championshipPlayers > 0) {
    items.push({ icon: "👑", text: `${stats.championshipPlayers} championship players`, accent: "#fbbf24" });
  }
  if (stats.squadRecruiting > 0) {
    items.push({ icon: "👥", text: `${stats.squadRecruiting} squads recruiting`, accent: "#38bdf8" });
  }

  // Top camp
  const topCamp = camps[0];
  if (topCamp) {
    const trendIcon = topCamp.trend === "surging" ? "▲▲" : topCamp.trend === "rising" ? "▲" : topCamp.trend === "falling" ? "▼" : "—";
    items.push({ icon: "⬡", text: `${topCamp.campName} ${trendIcon} leads`, accent: "#c084fc" });
  }

  // Active world event
  if (activeEvent) {
    items.push({ icon: "✦", text: activeEvent.title + " active", accent: "#fbbf24" });
  }

  return items;
}

export function WorldActivityTicker() {
  const stats       = useWorldStore((s) => s.worldStats);
  const camps       = useWorldStore((s) => s.campMomentum);
  const activeEvent = useWorldStore((s) => s.activeWorldEvent);

  const items = buildTickerItems(stats, camps, activeEvent);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length));
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    timerRef.current = setInterval(advance, CYCLE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance, items.length]);

  if (items.length === 0) return null;

  const current = items[currentIndex % items.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(4px, 0.5vw, 6px)",
        overflow: "hidden",
        height: 18,
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)", whiteSpace: "nowrap" }}
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: current.accent, boxShadow: `0 0 6px ${current.accent}`, flexShrink: 0 }}
          />
          <span style={{ fontSize: "var(--text-2xs, 8px)", fontWeight: 700, color: current.accent, letterSpacing: "0.08em" }}>
            {current.icon}
          </span>
          <span style={{ fontSize: "var(--text-2xs, 8px)", fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
            {current.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
