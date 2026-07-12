"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useInventoryUpdates } from "@/hooks/useInventoryUpdates";
import { useServerTime } from "@/hooks/useServerTime";

interface SkillColors {
  border: string;
  glow: string;
  bgFrom: string;
  bgTo: string;
  label: string;
}

const SKILL_COLORS: Record<string, SkillColors> = {
  steal_boost: { border: "#7c3aed", glow: "rgba(124,58,237,0.6)",  bgFrom: "#1a0635", bgTo: "#0a011a", label: "#a855f7" },
  shield:      { border: "#0284c7", glow: "rgba(2,132,199,0.6)",   bgFrom: "#031828", bgTo: "#020d18", label: "#38bdf8" },
  cloak:       { border: "#4f46e5", glow: "rgba(79,70,229,0.6)",   bgFrom: "#0d0e25", bgTo: "#06061a", label: "#818cf8" },
  multiplier:  { border: "#7c3aed", glow: "rgba(124,58,237,0.6)",  bgFrom: "#130530", bgTo: "#07021a", label: "#c084fc" },
  insurance:   { border: "#b45309", glow: "rgba(180,83,9,0.6)",    bgFrom: "#1c0e02", bgTo: "#100801", label: "#fbbf24" },
  revive:      { border: "#047857", glow: "rgba(4,120,87,0.6)",    bgFrom: "#031a10", bgTo: "#020f08", label: "#22c55e" },
  default:     { border: "#6b7280", glow: "rgba(107,114,128,0.4)", bgFrom: "#111111", bgTo: "#0a0a0a", label: "#9ca3af" },
};

const SKILL_ICONS: Record<string, string> = {
  steal_boost: "⚡",
  shield:      "🛡",
  cloak:       "👤",
  multiplier:  "2×",
  insurance:   "☂",
  revive:      "+",
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  steal_boost: "Boosts steal power",
  shield:      "Blocks next steal",
  cloak:       "Hides from targets",
  multiplier:  "Doubles token gains",
  insurance:   "Protects on steal",
  revive:      "Revive a teammate",
};

function formatCooldown(ms: number): string {
  if (ms <= 0) return "";
  if (ms < 1000) return "<1s";
  return `${Math.ceil(ms / 1000)}s`;
}

function SkillCard({
  skillId,
  name,
  icon,
  cooldownMs,
  charges,
  isReady,
  isActive,
  description,
  onActivate,
}: {
  skillId: string;
  name: string;
  icon: string;
  cooldownMs: number;
  charges?: number;
  isReady: boolean;
  isActive: boolean;
  description: string;
  onActivate?: () => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const colors = SKILL_COLORS[skillId] ?? SKILL_COLORS.default;
  const cdStr = formatCooldown(cooldownMs);

  const statusColor = isActive
    ? colors.label
    : !isReady && cooldownMs > 0
    ? "#f59e0b"
    : !isReady
    ? "rgba(255,255,255,0.25)"
    : colors.label;

  const statusText = isActive
    ? "ACTIVE"
    : cooldownMs > 0
    ? cdStr
    : !isReady
    ? "EMPTY"
    : "READY";

  return (
    <div className="skill-card" style={{ position: "relative" }}>
      {/* Long-press tooltip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 6,
              background: "rgba(10,4,22,0.95)",
              border: `1px solid ${colors.border}55`,
              borderRadius: 8,
              padding: "5px 8px",
              width: "max-content",
              maxWidth: 130,
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>
              {description}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        className="skill-btn"
        disabled={!isReady && !isActive}
        onClick={onActivate}
        onPointerDown={() => {
          const t = setTimeout(() => setShowTip(true), 500);
          const up = () => { clearTimeout(t); setShowTip(false); window.removeEventListener("pointerup", up); };
          window.addEventListener("pointerup", up);
        }}
        whileHover={isReady ? { scale: 1.04 } : undefined}
        whileTap={isReady ? { scale: 0.94 } : undefined}
        animate={
          isActive
            ? { boxShadow: [`0 0 8px ${colors.glow}`, `0 0 20px ${colors.glow}`, `0 0 8px ${colors.glow}`] }
            : isReady
            ? { boxShadow: `0 0 12px ${colors.glow}` }
            : { boxShadow: "none" }
        }
        transition={isActive ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{
          background: `linear-gradient(160deg, ${colors.bgFrom}, ${colors.bgTo})`,
          border: `1.5px solid ${isReady || isActive ? colors.border : "rgba(107,114,128,0.3)"}`,
          opacity: !isReady && !isActive ? 0.5 : 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Recharge bar overlay */}
        {cooldownMs > 0 && (
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: cooldownMs / 1000, ease: "linear" }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
              background: "rgba(0,0,0,0.55)",
              transformOrigin: "bottom",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Icon */}
        <span
          style={{
            fontSize: "clamp(18px, 2.4vw, 24px)",
            lineHeight: 1,
            fontWeight: 900,
            color: isReady ? colors.label : "rgba(255,255,255,0.35)",
            textShadow: isReady ? `0 0 10px ${colors.glow}` : "none",
            zIndex: 2,
            position: "relative",
          }}
        >
          {icon}
        </span>

        {/* Charges badge */}
        {charges !== undefined && charges > 0 && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 5,
              minWidth: 14,
              height: 14,
              borderRadius: 9999,
              background: colors.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              zIndex: 3,
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 900, color: "#000" }}>{charges}</span>
          </div>
        )}
      </motion.button>

      <span className="skill-label" style={{ color: "rgba(255,255,255,0.6)" }}>
        {name}
      </span>
      <span className="skill-status" style={{ color: statusColor }}>
        {statusText}
      </span>
    </div>
  );
}

const FALLBACK_SKILLS = [
  { id: "steal_boost", name: "STEAL",     charges: 2, cooldownMs: 0,     isReady: true,  isActive: false },
  { id: "shield",      name: "SHIELD",    charges: 1, cooldownMs: 0,     isReady: true,  isActive: false },
  { id: "cloak",       name: "CLOAK",     charges: 0, cooldownMs: 12000, isReady: false, isActive: false },
  { id: "multiplier",  name: "2×",        charges: 1, cooldownMs: 0,     isReady: true,  isActive: false },
  { id: "insurance",   name: "INSURE",    charges: 1, cooldownMs: 0,     isReady: true,  isActive: false },
  { id: "revive",      name: "REVIVE",    charges: 1, cooldownMs: 0,     isReady: true,  isActive: false },
  { id: "default",     name: "MORE",      charges: 0, cooldownMs: 0,     isReady: false, isActive: false },
];

export function SkillDockHUD() {
  const { subSessionId } = useSessionStore();
  const skills = useInventoryStore((s) => s.skills);
  const serverTime = useServerTime();

  useInventoryUpdates(null, subSessionId);

  const displaySkills = skills.length > 0
    ? skills.map(s => ({
        id: s.id ?? "default",
        name: (s.name ?? "SKILL").slice(0, 6).toUpperCase(),
        charges: s.charges,
        cooldownMs: s.cooldown_until ? serverTime.getCountdown(s.cooldown_until) : 0,
        isReady: s.available && s.charges > 0,
        isActive: false,
      }))
    : FALLBACK_SKILLS;

  return (
    <div className="zone-skills">
      <div className="skill-dock">
        {displaySkills.map(skill => (
          <SkillCard
            key={skill.id}
            skillId={skill.id}
            name={skill.name}
            icon={SKILL_ICONS[skill.id] ?? "✦"}
            cooldownMs={skill.cooldownMs}
            charges={skill.charges}
            isReady={skill.isReady}
            isActive={skill.isActive}
            description={SKILL_DESCRIPTIONS[skill.id] ?? "Use this skill"}
          />
        ))}
      </div>
    </div>
  );
}
