"use client";

/**
 * ReturnSummary — Player Return Experience
 *
 * Returning players never land on a blank Home.
 * They receive a world briefing: "Here's what happened while you were away."
 *
 * Design philosophy:
 *   - No pressure. Only reality.
 *   - Players create their own urgency.
 *   - Delivers FOMO through truth, not manipulation.
 *
 * Shows:
 *   - Sessions completed since last visit
 *   - Camp rank changes
 *   - Rival wins
 *   - Squad members who ranked up
 *   - World announcements
 *   - New world records
 */

import { motion, AnimatePresence } from "framer-motion";
import { useWorldStore }           from "@/stores/useWorldStore";
import type { WorldHistoryEntry }  from "@/lib/world/worldTimeline";

interface ReturnSummaryProps {
  visible: boolean;
  onDismiss: () => void;
}

function SummaryRow({
  icon,
  label,
  value,
  accent,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "clamp(6px,0.8vw,9px) clamp(10px,1.2vw,14px)",
        borderRadius:   "clamp(8px,1vw,10px)",
        background:     `${accent}10`,
        border:         `1px solid ${accent}30`,
        marginBottom:   "clamp(4px,0.5vw,6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px,0.8vw,9px)" }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: "clamp(10px,1.1vw,13px)", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: "clamp(12px,1.3vw,15px)", fontWeight: 900, color: accent, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </motion.div>
  );
}

function WorldEntryLine({ entry }: { entry: WorldHistoryEntry }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(168,85,247,0.08)" }}>
      {entry.isRecord && <span style={{ fontSize: 10 }}>🏆</span>}
      <span style={{ fontSize: "clamp(9px,1vw,11px)", color: "rgba(255,255,255,0.6)", flex: 1, lineHeight: 1.4 }}>
        {entry.headline}
      </span>
      <span style={{ fontSize: "clamp(8px,0.9vw,10px)", color: "rgba(168,85,247,0.4)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        {formatTimeAgo(entry.timestamp)}
      </span>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d > 0)  return `${d}d`;
  if (h > 0)  return `${h}h`;
  if (m > 0)  return `${m}m`;
  return "now";
}

export function ReturnSummary({ visible, onDismiss }: ReturnSummaryProps) {
  const summary = useWorldStore((s) => s.returnSummary);

  if (!summary?.isReady) return null;

  const absentHours = Math.floor((Date.now() - summary.lastSeenAt) / 3_600_000);
  const absentLabel = absentHours < 1 ? "a few minutes"
    : absentHours < 24 ? `${absentHours}h`
    : `${Math.floor(absentHours / 24)}d`;

  const hasAnything =
    summary.sessionsCompleted > 0 ||
    summary.campRankChange !== 0  ||
    summary.rivalWins > 0         ||
    summary.squadMembersRankedUp.length > 0 ||
    summary.worldAnnouncements.length > 0;

  if (!hasAnything) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(4,2,10,0.88)",
            backdropFilter: "blur(14px)",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px,4vw,24px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.93, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{
              width: "100%", maxWidth: 440,
              background: "linear-gradient(160deg,rgba(14,6,28,0.98),rgba(5,2,12,0.99))",
              borderRadius: 24,
              border: "1px solid rgba(168,85,247,0.22)",
              padding: "clamp(20px,3vw,28px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(88,28,135,0.15)",
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: "clamp(14px,1.8vw,20px)" }}
            >
              <div style={{ fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(168,85,247,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                WELCOME BACK
              </div>
              <div style={{ fontSize: "clamp(16px,2vw,20px)", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                While you were away
              </div>
              <div style={{ fontSize: "clamp(10px,1.1vw,12px)", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                The last {absentLabel}
              </div>
            </motion.div>

            {/* Summary rows */}
            <div style={{ marginBottom: "clamp(10px,1.2vw,14px)" }}>
              {summary.sessionsCompleted > 0 && (
                <SummaryRow icon="▦" label="Sessions Completed"   value={summary.sessionsCompleted} accent="#a855f7" delay={0.15} />
              )}
              {summary.campRankChange !== 0 && (
                <SummaryRow
                  icon="⬡"
                  label="Your Camp Rank"
                  value={summary.campRankChange > 0 ? `▲ +${summary.campRankChange}` : `▼ ${summary.campRankChange}`}
                  accent={summary.campRankChange > 0 ? "#22c55e" : "#ef4444"}
                  delay={0.2}
                />
              )}
              {summary.rivalWins > 0 && (
                <SummaryRow icon="⚡" label="Rival Wins"           value={summary.rivalWins}  accent="#ef4444" delay={0.25} />
              )}
              {summary.squadMembersRankedUp.length > 0 && (
                <SummaryRow
                  icon="👥"
                  label="Squad Members Ranked Up"
                  value={summary.squadMembersRankedUp.length}
                  accent="#fbbf24"
                  delay={0.3}
                />
              )}
            </div>

            {/* World announcements */}
            {summary.worldAnnouncements.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  padding:      "clamp(8px,1vw,12px)",
                  borderRadius: "clamp(8px,1vw,10px)",
                  background:   "rgba(88,28,135,0.12)",
                  border:       "1px solid rgba(168,85,247,0.15)",
                  marginBottom: "clamp(10px,1.2vw,14px)",
                }}
              >
                <div style={{ fontSize: "clamp(8px,0.85vw,9px)", fontWeight: 800, letterSpacing: "0.16em", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", marginBottom: 8 }}>
                  WORLD EVENTS
                </div>
                {summary.worldAnnouncements.slice(0, 4).map((e) => (
                  <WorldEntryLine key={e.id} entry={e} />
                ))}
              </motion.div>
            )}

            {/* World records */}
            {summary.worldRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: "clamp(10px,1.2vw,14px)" }}
              >
                <div style={{ fontSize: "clamp(8px,0.85vw,9px)", fontWeight: 800, letterSpacing: "0.16em", color: "rgba(251,191,36,0.55)", textTransform: "uppercase", marginBottom: 8 }}>
                  🏆 NEW RECORDS
                </div>
                {summary.worldRecords.slice(0, 2).map((e) => (
                  <WorldEntryLine key={e.id} entry={e} />
                ))}
              </motion.div>
            )}

            {/* Dismiss */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.97 }}
              onClick={onDismiss}
              style={{
                width:        "100%",
                padding:      "clamp(11px,1.4vw,14px) 0",
                borderRadius: 14,
                border:       "1.5px solid rgba(168,85,247,0.35)",
                background:   "rgba(88,28,135,0.15)",
                fontSize:     "clamp(11px,1.2vw,13px)",
                fontWeight:   800,
                color:        "#c084fc",
                letterSpacing:"0.15em",
                textTransform:"uppercase",
                cursor:       "pointer",
              }}
            >
              ENTER THE WORLD
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
