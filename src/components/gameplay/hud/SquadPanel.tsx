"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SquadMemberHUD {
  id: string;
  name: string;
  isYou?: boolean;
  tokens: number;
  isEliminated?: boolean;
  isRevivable?: boolean;
  hasShield?: boolean;
  hasCloak?: boolean;
  hasInsurance?: boolean;
  voiceActive?: boolean;
  connectionStrength?: 0 | 1 | 2 | 3;
  avatar: string;
  isSpeaking?: boolean;
  isBeingStolen?: boolean;
  isReviving?: boolean;
}

const MOCK_SQUAD: SquadMemberHUD[] = [
  { id: "1", name: "PhantomX",  isYou: true,  tokens: 62,  voiceActive: true,  isSpeaking: true,  avatar: "👻", connectionStrength: 3, hasShield: true },
  { id: "2", name: "NovaQueen",              tokens: 56,  voiceActive: true,  avatar: "🌟", connectionStrength: 3, hasInsurance: true },
  { id: "3", name: "Ghost",                  tokens: 45,  voiceActive: false, avatar: "🦇", connectionStrength: 2, hasCloak: true },
  { id: "4", name: "ShadowX",  isEliminated: true, isRevivable: true, tokens: 30, voiceActive: false, avatar: "💀", connectionStrength: 1 },
];

function ConnectionBars({ strength = 3 }: { strength?: number }) {
  return (
    <div style={{ display: "flex", gap: 1.5, alignItems: "flex-end", height: 9 }}>
      {[3, 6, 9].map((h, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            height: h,
            borderRadius: 1.5,
            background: i < strength ? "#22c55e" : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

function EffectBadges({ shield, cloak, insurance }: { shield?: boolean; cloak?: boolean; insurance?: boolean }) {
  if (!shield && !cloak && !insurance) return null;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {shield    && <span style={{ fontSize: 8 }}>🛡</span>}
      {cloak     && <span style={{ fontSize: 8 }}>👤</span>}
      {insurance && <span style={{ fontSize: 8 }}>☂️</span>}
    </div>
  );
}

function MemberRow({ member }: { member: SquadMemberHUD }) {
  const maxTokens = 100;
  const pct = Math.min(100, (member.tokens / maxTokens) * 100);
  const barColor = member.isEliminated
    ? "#374151"
    : pct > 50 ? "#7c3aed" : pct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      layout
      animate={
        member.isBeingStolen
          ? { x: [-3, 3, -2, 2, 0], transition: { duration: 0.4 } }
          : member.isReviving
          ? { boxShadow: ["0 0 0px transparent", "0 0 12px #22c55e", "0 0 0px transparent"] }
          : member.isSpeaking
          ? { boxShadow: ["0 0 0px transparent", "0 0 8px rgba(34,197,94,0.5)", "0 0 0px transparent"] }
          : {}
      }
      transition={member.isSpeaking ? { duration: 1, repeat: Infinity } : undefined}
      className="squad-member-row"
      style={{
        opacity: member.isEliminated ? 0.45 : 1,
        borderRadius: "clamp(5px, 0.7vw, 7px)",
        padding: "clamp(2px, 0.3vw, 4px)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "clamp(20px, 2.6vw, 26px)",
          height: "clamp(20px, 2.6vw, 26px)",
          borderRadius: "50%",
          background: member.isYou
            ? "linear-gradient(135deg,#7c3aed,#581c87)"
            : member.isEliminated
            ? "rgba(20,0,30,0.7)"
            : "linear-gradient(135deg,rgba(49,7,70,0.7),rgba(15,0,30,0.8))",
          border: member.isSpeaking
            ? "1.5px solid #22c55e"
            : member.isYou
            ? "1.5px solid #a855f7"
            : "1px solid rgba(168,85,247,0.22)",
          boxShadow: member.isSpeaking ? "0 0 8px rgba(34,197,94,0.6)" : member.isYou ? "0 0 5px rgba(168,85,247,0.4)" : "none",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(10px, 1.3vw, 14px)",
          position: "relative",
        }}
      >
        {member.avatar}
        {/* Speaking waveform ring */}
        {member.isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "1px solid #22c55e" }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: member.isYou ? 700 : 600, color: member.isEliminated ? "rgba(255,255,255,0.35)" : member.isYou ? "#fff" : "rgba(255,255,255,0.75)", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "clamp(48px, 6vw, 64px)" }}>
              {member.name}
            </span>
            {member.isYou && <span style={{ fontSize: "var(--text-2xs)", color: "#a855f7", fontWeight: 700 }}>YOU</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <EffectBadges shield={member.hasShield} cloak={member.hasCloak} insurance={member.hasInsurance} />
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: member.isEliminated ? "rgba(255,255,255,0.3)" : barColor, fontVariantNumeric: "tabular-nums" }}>
              {member.isEliminated ? (member.isRevivable ? "↩" : "✕") : member.tokens}
            </span>
          </div>
        </div>

        {/* Token bar */}
        <div style={{ height: "clamp(2px, 0.3vw, 3px)", borderRadius: 9999, overflow: "hidden", background: "rgba(49,7,70,0.5)", border: "1px solid rgba(168,85,247,0.1)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: member.isEliminated ? "0%" : `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 9999, background: barColor === "#7c3aed" ? "linear-gradient(90deg,#7c3aed,#a855f7)" : barColor === "#f59e0b" ? "linear-gradient(90deg,#92400e,#f59e0b)" : "linear-gradient(90deg,#7f1d1d,#ef4444)", boxShadow: `0 0 4px ${barColor}88` }}
          />
        </div>
      </div>

      {/* Connection */}
      <ConnectionBars strength={member.connectionStrength} />
    </motion.div>
  );
}

export function SquadPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(4px, 0.5vw, 6px)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.14em", color: "#c084fc", textTransform: "uppercase", textShadow: "0 0 7px rgba(192,132,252,0.35)" }}>
            SQUAD
          </span>
          <div style={{ padding: "1px 5px", borderRadius: 9999, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, color: "#a855f7" }}>
              {MOCK_SQUAD.filter(m => !m.isEliminated).length}/{MOCK_SQUAD.length}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center" }}
          aria-label={expanded ? "Collapse squad" : "Expand squad"}
        >
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="10" height="10" viewBox="0 0 24 24" fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="rgba(168,85,247,0.65)" strokeWidth="2.5" strokeLinecap="round" />
          </motion.svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden", flex: 1 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px, 0.3vw, 4px)" }}>
              {MOCK_SQUAD.map(m => <MemberRow key={m.id} member={m} />)}
            </div>

            {/* Revive prompt if applicable */}
            {MOCK_SQUAD.some(m => m.isRevivable) && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: "clamp(4px, 0.5vw, 6px)",
                  width: "100%",
                  padding: "clamp(4px, 0.5vw, 6px)",
                  borderRadius: "clamp(5px, 0.7vw, 8px)",
                  border: "1px solid rgba(34,197,94,0.4)",
                  background: "rgba(34,197,94,0.08)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: 10 }}>💚</span>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  REVIVE AVAILABLE
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
