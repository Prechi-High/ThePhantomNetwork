"use client";

import { motion } from "framer-motion";

interface Skill {
  id: string;
  name: string;
  icon: React.ReactNode;
  borderColor: string;
  glowColor: string;
  bgFrom: string;
  bgTo: string;
  ready: boolean;
  badge?: React.ReactNode;
  labelColor: string;
}

const SKILLS: Skill[] = [
  {
    id: "steal_boost",
    name: "STEAL BOOST",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
      </svg>
    ),
    borderColor: "#7c3aed",
    glowColor: "rgba(124,58,237,0.6)",
    bgFrom: "#200840",
    bgTo: "#0d0220",
    ready: true,
    labelColor: "#a855f7",
  },
  {
    id: "shield",
    name: "SHIELD",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z"
          fill="#38bdf8"
          stroke="#7dd3fc"
          strokeWidth="0.5"
        />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    borderColor: "#0284c7",
    glowColor: "rgba(2,132,199,0.6)",
    bgFrom: "#041c30",
    bgTo: "#020e1c",
    ready: true,
    labelColor: "#38bdf8",
  },
  {
    id: "cloak",
    name: "CLOAK",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z"
          fill="#818cf8"
          stroke="#a5b4fc"
          strokeWidth="0.5"
        />
        <circle cx="9.5" cy="10" r="1.2" fill="rgba(0,0,0,0.5)" />
        <circle cx="14.5" cy="10" r="1.2" fill="rgba(0,0,0,0.5)" />
      </svg>
    ),
    borderColor: "#4338ca",
    glowColor: "rgba(67,56,202,0.6)",
    bgFrom: "#1e1b4b",
    bgTo: "#0e0c2a",
    ready: true,
    labelColor: "#818cf8",
  },
  {
    id: "multiplier",
    name: "MULTIPLIER",
    icon: (
      <span
        style={{
          fontSize: "22px",
          fontWeight: 900,
          color: "#c084fc",
          lineHeight: 1,
          textShadow: "0 0 10px rgba(192,132,252,0.8)",
        }}
      >
        2x
      </span>
    ),
    borderColor: "#7c3aed",
    glowColor: "rgba(124,58,237,0.6)",
    bgFrom: "#1a0540",
    bgTo: "#0a0120",
    ready: true,
    badge: (
      <div
        style={{
          position: "absolute",
          top: "2px",
          right: "2px",
          background: "#7c3aed",
          borderRadius: "4px",
          padding: "1px 4px",
          fontSize: "8px",
          fontWeight: 900,
          color: "white",
          lineHeight: 1,
          boxShadow: "0 0 6px rgba(124,58,237,0.8)",
        }}
      >
        x2
      </div>
    ),
    labelColor: "#c084fc",
  },
  {
    id: "insurance",
    name: "INSURANCE",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12H21C21 7 17 3 12 3Z" fill="#fbbf24" />
        <line x1="12" y1="12" x2="12" y2="19" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 19C12 19 10 21 8 21" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    borderColor: "#b45309",
    glowColor: "rgba(180,83,9,0.6)",
    bgFrom: "#2d1505",
    bgTo: "#150a02",
    ready: true,
    labelColor: "#fbbf24",
  },
  {
    id: "revive",
    name: "REVIVE TOKEN",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#22c55e" opacity="0.9" />
        <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    borderColor: "#15803d",
    glowColor: "rgba(21,128,61,0.6)",
    bgFrom: "#052814",
    bgTo: "#02120a",
    ready: true,
    badge: (
      <div
        style={{
          position: "absolute",
          top: "-3px",
          right: "-3px",
          background: "#22c55e",
          borderRadius: "50%",
          width: "16px",
          height: "16px",
          fontSize: "8px",
          fontWeight: 900,
          color: "#000",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 6px rgba(34,197,94,0.8)",
        }}
      >
        x2
      </div>
    ),
    labelColor: "#22c55e",
  },
];

export function SkillDockHUD() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: "linear-gradient(180deg,rgba(6,3,15,0.0) 0%,rgba(6,3,15,0.98) 15%)",
        paddingTop: "4px",
        paddingBottom: "env(safe-area-inset-bottom,0px)",
      }}
    >
      {/* MY SKILLS header */}
      <div className="flex items-center justify-between px-[10px] mb-[6px]">
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.65)",
            textTransform: "uppercase",
          }}
        >
          MY SKILLS
        </span>
        <button className="flex items-center gap-[3px]">
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(168,85,247,0.7)",
              textTransform: "uppercase",
            }}
          >
            SCROLL
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Skills row */}
      <div
        className="flex items-end px-[6px] gap-[4px] overflow-x-auto scrollbar-hide"
        style={{ paddingBottom: "8px" }}
      >
        {SKILLS.map((skill) => (
          <div key={skill.id} className="flex flex-col items-center gap-[4px] flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.93 }}
              className="relative flex items-center justify-center rounded-[14px] focus:outline-none"
              style={{
                width: "54px",
                height: "54px",
                background: `linear-gradient(145deg,${skill.bgFrom},${skill.bgTo})`,
                border: `1.5px solid ${skill.borderColor}`,
                boxShadow: skill.ready
                  ? `0 0 12px ${skill.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : "none",
              }}
            >
              {/* Specular */}
              <div
                className="absolute top-[3px] left-1/2 pointer-events-none"
                style={{
                  transform: "translateX(-50%)",
                  width: "60%",
                  height: "30%",
                  background: "linear-gradient(180deg,rgba(255,255,255,0.14) 0%,transparent 100%)",
                  borderRadius: "50%",
                  filter: "blur(2px)",
                }}
              />
              {skill.icon}
              {skill.badge}
            </motion.button>

            <span
              style={{
                fontSize: "8px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: "54px",
              }}
            >
              {skill.name}
            </span>

            {/* READY badge */}
            <span
              style={{
                fontSize: "8px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: skill.labelColor,
                textTransform: "uppercase",
                textShadow: `0 0 6px ${skill.glowColor}`,
              }}
            >
              READY
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
