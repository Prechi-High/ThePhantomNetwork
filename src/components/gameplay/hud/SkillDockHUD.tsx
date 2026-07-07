"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/useSessionStore";
import { useInventoryStore, type SkillInInventory } from "@/stores/useInventoryStore";
import { useInventoryUpdates } from "@/hooks/useInventoryUpdates";
import { useServerTime } from "@/hooks/useServerTime";

// Default skill display icons
const SKILL_ICONS: Record<string, React.ReactNode> = {
  steal_boost: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z" fill="#38bdf8" stroke="#7dd3fc" strokeWidth="0.5" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cloak: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z" fill="#818cf8" stroke="#a5b4fc" strokeWidth="0.5" />
      <circle cx="9.5" cy="10" r="1.2" fill="rgba(0,0,0,0.5)" />
      <circle cx="14.5" cy="10" r="1.2" fill="rgba(0,0,0,0.5)" />
    </svg>
  ),
  multiplier: (
    <span style={{ fontSize: "20px", fontWeight: 900, color: "#c084fc", lineHeight: 1, textShadow: "0 0 8px rgba(192,132,252,0.75)" }}>
      2x
    </span>
  ),
  insurance: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7 3 3 7 3 12H21C21 7 17 3 12 3Z" fill="#fbbf24" />
      <line x1="12" y1="12" x2="12" y2="19" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 19C12 19 10 21 8 21" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  revive: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#22c55e" opacity="0.88" />
      <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};

const SKILL_COLORS: Record<string, { borderColor: string; glowColor: string; bgFrom: string; bgTo: string; labelColor: string }> = {
  steal_boost: {
    borderColor: "#7c3aed",
    glowColor: "rgba(124,58,237,0.55)",
    bgFrom: "#1a0635",
    bgTo: "#0a011a",
    labelColor: "#a855f7",
  },
  shield: {
    borderColor: "#0284c7",
    glowColor: "rgba(2,132,199,0.55)",
    bgFrom: "#031828",
    bgTo: "#010c18",
    labelColor: "#38bdf8",
  },
  cloak: {
    borderColor: "#4338ca",
    glowColor: "rgba(67,56,202,0.55)",
    bgFrom: "#181540",
    bgTo: "#0b0a22",
    labelColor: "#818cf8",
  },
  multiplier: {
    borderColor: "#7c3aed",
    glowColor: "rgba(124,58,237,0.55)",
    bgFrom: "#160435",
    bgTo: "#08011a",
    labelColor: "#c084fc",
  },
  insurance: {
    borderColor: "#b45309",
    glowColor: "rgba(180,83,9,0.55)",
    bgFrom: "#261203",
    bgTo: "#110801",
    labelColor: "#fbbf24",
  },
  revive: {
    borderColor: "#15803d",
    glowColor: "rgba(21,128,61,0.55)",
    bgFrom: "#041f10",
    bgTo: "#020f08",
    labelColor: "#22c55e",
  },
};

export function SkillDockHUD() {
  const { currentUserId, subSessionId } = useSessionStore();
  const skills = useInventoryStore((s) => s.skills);
  const serverTime = useServerTime();

  // Subscribe to inventory updates
  useInventoryUpdates(currentUserId, subSessionId);

  // Filter to show only owned skills
  const ownedSkills = skills.filter((skill) => skill.owned);

  return (
    <div className="skills-dock" style={{ paddingBottom: "env(safe-area-inset-bottom,var(--space-1))" }}>
      {/* Header */}
      <div className="skills-header">
        <span className="text-sm" style={{ fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
          MY SKILLS
        </span>
        <button style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span className="text-xs" style={{ fontWeight: 700, letterSpacing: "0.1em", color: "rgba(168,85,247,0.6)", textTransform: "uppercase" }}>
            SCROLL
          </span>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.6)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Skills row */}
      <div className="skills-scroll">
        {ownedSkills.map((skill) => {
          const colors = SKILL_COLORS[skill.id] || SKILL_COLORS.shield;
          const icon = SKILL_ICONS[skill.id];
          const isLocked = !skill.owned;
          const isOnCooldown = !skill.available && skill.cooldown_until;
          const cooldownRemaining = isOnCooldown ? serverTime.getCountdown(skill.cooldown_until) : 0;
          const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);

          let statusText = "READY";
          let statusColor = colors.labelColor;

          if (isLocked) {
            statusText = "LOCKED";
            statusColor = "rgba(255,255,255,0.3)";
          } else if (isOnCooldown) {
            statusText = `${cooldownSeconds}s`;
            statusColor = "#f59e0b";
          } else if (skill.charges && skill.max_charges && skill.charges < skill.max_charges) {
            statusText = `${skill.charges}/${skill.max_charges}`;
            statusColor = colors.labelColor;
          }

          return (
            <div key={skill.id} className="skill-item" style={{ opacity: isLocked ? 0.5 : 1 }}>
              <motion.button
                whileTap={{ scale: isLocked || isOnCooldown ? 1 : 0.92 }}
                disabled={isLocked || isOnCooldown}
                className="skill-card"
                style={{
                  background: `linear-gradient(145deg,${colors.bgFrom},${colors.bgTo})`,
                  borderColor: colors.borderColor,
                  boxShadow: `0 0 10px ${colors.glowColor}, inset 0 1px 0 rgba(255,255,255,0.07)`,
                  cursor: isLocked || isOnCooldown ? "not-allowed" : "pointer",
                }}
              >
                {/* Specular sheen */}
                <div
                  style={{
                    position: "absolute",
                    top: "clamp(2px,0.3vw,4px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "58%",
                    height: "28%",
                    background: "linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%)",
                    borderRadius: "50%",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                  }}
                />
                {icon}
                {skill.charges && skill.max_charges > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: colors.labelColor,
                      borderRadius: "3px",
                      padding: "1px 3px",
                      fontSize: "7px",
                      fontWeight: 900,
                      color: colors.bgFrom,
                      lineHeight: 1,
                      boxShadow: `0 0 5px ${colors.glowColor}`,
                    }}
                  >
                    {skill.charges}
                  </div>
                )}
              </motion.button>

              <span className="skill-label" style={{ color: "rgba(255,255,255,0.65)" }}>
                {skill.name}
              </span>

              <span className="skill-status" style={{ color: statusColor, textShadow: `0 0 5px ${colors.glowColor}` }}>
                {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
