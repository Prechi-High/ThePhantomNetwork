"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";

// --- Sector definitions matching reference image exactly ---
// Reference shows 8 sectors at 45° each:
// Top: STEAL (red flame), top-right: MULTIPLIER (2x), right: SHIELD (blue shield),
// bottom-right: REVIVE (green cross), bottom: CLOAK (purple ghost), bottom-left: INSURANCE (yellow umbrella),
// left: JACKPOT (crown), top-left: (purple/advance area)

interface Sector {
  id: string;
  label: string;
  startAngle: number; // degrees
  color: string;
  darkColor: string;
  icon: React.ReactNode;
  textColor: string;
  badge?: React.ReactNode;
}

function SteelIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Flame icon */}
      <path
        d="M12 2C12 2 10 5 10 8C8 7 7 5 7 5C7 5 5 10 8 14C9 16 11 17 12 17C13 17 15 16 16 14C19 10 17 5 17 5C17 5 16 7 14 8C14 5 12 2 12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <circle cx="12" cy="17" r="3" fill={color} opacity="0.6" />
    </svg>
  );
}

function CrownIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 18L5 9L9 14L12 7L15 14L19 9L21 18H3Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <rect x="3" y="18" width="18" height="2.5" rx="1" fill={color} />
    </svg>
  );
}

function UmbrellaIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7 3 3 7 3 12H21C21 7 17 3 12 3Z" fill={color} />
      <line x1="12" y1="12" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19C12 19 10 21 8 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 7v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V7L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GhostIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C8 3 5 6.5 5 10v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10C22 6.5 19 3 12 3Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <circle cx="9.5" cy="10.5" r="1.5" fill="rgba(0,0,0,0.6)" />
      <circle cx="14.5" cy="10.5" r="1.5" fill="rgba(0,0,0,0.6)" />
    </svg>
  );
}

function ReviveIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={color} opacity="0.85" />
      <path
        d="M12 8v8M8 12h8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SECTORS: Sector[] = [
  {
    id: "STEAL",
    label: "STEAL",
    startAngle: -22.5, // centered at top (0°)
    color: "#be123c",
    darkColor: "#450a0a",
    icon: <SteelIcon color="#fb7185" />,
    textColor: "#fb7185",
  },
  {
    id: "MULTIPLIER",
    label: "MULTIPLIER",
    startAngle: 22.5,
    color: "#581c87",
    darkColor: "#1e0533",
    icon: (
      <span style={{ fontSize: "20px", fontWeight: 900, color: "#c084fc", lineHeight: 1 }}>
        2x
      </span>
    ),
    textColor: "#c084fc",
    badge: (
      <span
        style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          background: "#7c3aed",
          color: "white",
          fontSize: "8px",
          fontWeight: 800,
          borderRadius: "4px",
          padding: "1px 3px",
          lineHeight: 1,
          boxShadow: "0 0 6px rgba(124,58,237,0.8)",
        }}
      >
        2x
      </span>
    ),
  },
  {
    id: "SHIELD",
    label: "SHIELD",
    startAngle: 67.5,
    color: "#1e3a8a",
    darkColor: "#0c1a3e",
    icon: <ShieldIcon color="#60a5fa" />,
    textColor: "#60a5fa",
  },
  {
    id: "REVIVE",
    label: "REVIVE",
    startAngle: 112.5,
    color: "#14532d",
    darkColor: "#052814",
    icon: <ReviveIcon color="#4ade80" />,
    textColor: "#4ade80",
  },
  {
    id: "CLOAK",
    label: "CLOAK",
    startAngle: 157.5,
    color: "#4c1d95",
    darkColor: "#1a0540",
    icon: <GhostIcon color="#a78bfa" />,
    textColor: "#a78bfa",
  },
  {
    id: "INSURANCE",
    label: "INSURANCE",
    startAngle: 202.5,
    color: "#713f12",
    darkColor: "#2d1505",
    icon: <UmbrellaIcon color="#fbbf24" />,
    textColor: "#fbbf24",
  },
  {
    id: "JACKPOT",
    label: "JACKPOT",
    startAngle: 247.5,
    color: "#78350f",
    darkColor: "#2d1505",
    icon: <CrownIcon color="#fcd34d" />,
    textColor: "#fcd34d",
  },
  {
    id: "ADVANCE",
    label: "ADVANCE",
    startAngle: 292.5,
    color: "#312e81",
    darkColor: "#0c0a2e",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#818cf8" />
      </svg>
    ),
    textColor: "#818cf8",
  },
];

const SVG_SIZE = 280;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const OUTER_R = 128;
const INNER_R = 44;
const LABEL_R = 100;
const ICON_R = 82;
const DEG = Math.PI / 180;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg - 90) * DEG;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function sectorPath(cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) {
  const op1 = polarToCartesian(cx, cy, outerR, startAngle);
  const op2 = polarToCartesian(cx, cy, outerR, endAngle);
  const ip1 = polarToCartesian(cx, cy, innerR, endAngle);
  const ip2 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${op1.x} ${op1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${op2.x} ${op2.y}`,
    `L ${ip1.x} ${ip1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ip2.x} ${ip2.y}`,
    "Z",
  ].join(" ");
}

interface WheelHUDProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

export function WheelHUD({ isSpinning, outcome, onSpinComplete }: WheelHUDProps) {
  const controls = useAnimation();
  const currentRotRef = useRef(0);

  useEffect(() => {
    if (!isSpinning || !outcome) return;

    const sectorIndex = SECTORS.findIndex((s) => s.id === outcome);
    const targetCenterAngle = sectorIndex >= 0 ? sectorIndex * 45 : 0;
    // We want that sector at top (0°). Wheel needs to rotate so targetCenterAngle aligns to 0.
    // target offset from current
    let normalised = currentRotRef.current % 360;
    if (normalised < 0) normalised += 360;
    let delta = (360 - targetCenterAngle) - normalised;
    if (delta <= 0) delta += 360;

    const total = currentRotRef.current + 5 * 360 + delta;
    currentRotRef.current = total;

    controls.start({
      rotate: total,
      transition: { duration: 8, ease: [0.15, 0.05, 0.2, 1] },
    });
  }, [isSpinning, outcome, controls]);

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Outer ambient glow rings */}
      <div
        style={{
          position: "absolute",
          inset: "calc(var(--wheel-size) * -0.086)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(168,85,247,0) 55%,rgba(168,85,247,0.35) 75%,rgba(168,85,247,0) 100%)",
          filter: "blur(12px)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "calc(var(--wheel-size) * -0.029)",
          border: "2px solid rgba(168,85,247,0.25)",
          borderRadius: "50%",
          boxShadow: "0 0 30px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1)",
          pointerEvents: "none"
        }}
      />

      {/* Static outer metallic ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "linear-gradient(135deg,rgba(168,85,247,0.5) 0%,rgba(88,28,135,0.3) 50%,rgba(168,85,247,0.5) 100%)",
          border: "3px solid rgba(168,85,247,0.6)",
          boxShadow:
            "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.2), inset 0 0 20px rgba(168,85,247,0.15)",
          pointerEvents: "none"
        }}
      />

      {/* Rotating wheel */}
      <motion.div
        animate={controls}
        onAnimationComplete={() => { if (isSpinning) onSpinComplete(); }}
        style={{
          position: "absolute",
          width: "calc(var(--wheel-size) - 8px)",
          height: "calc(var(--wheel-size) - 8px)",
          left: "4px",
          top: "4px",
          borderRadius: "50%",
          overflow: "hidden"
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            {SECTORS.map((sector, i) => (
              <radialGradient
                key={`grad-${i}`}
                id={`sg-${i}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={sector.color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={sector.darkColor} stopOpacity="1" />
              </radialGradient>
            ))}
            {/* Specular overlay */}
            <radialGradient id="specular" cx="35%" cy="25%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            {/* Inner ring glow */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.3)" />
              <stop offset="100%" stopColor="rgba(88,28,135,0)" />
            </radialGradient>
          </defs>

          {SECTORS.map((sector, i) => {
            const start = i * 45 - 22.5;
            const end = i * 45 + 22.5;
            return (
              <path
                key={sector.id}
                d={sectorPath(CX, CY, INNER_R + 2, OUTER_R - 2, start, end)}
                fill={`url(#sg-${i})`}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Divider lines (metallic) */}
          {SECTORS.map((_, i) => {
            const angle = i * 45 - 22.5;
            const inner = polarToCartesian(CX, CY, INNER_R + 4, angle);
            const outer = polarToCartesian(CX, CY, OUTER_R - 2, angle);
            return (
              <line
                key={`div-${i}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(168,85,247,0.45)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Specular gloss */}
          <circle cx={CX} cy={CY} r={OUTER_R - 2} fill="url(#specular)" />

          {/* Outer ring border */}
          <circle
            cx={CX}
            cy={CY}
            r={OUTER_R - 1}
            fill="none"
            stroke="rgba(168,85,247,0.5)"
            strokeWidth="2"
          />

          {/* Inner glow ring */}
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R + 1}
            fill="none"
            stroke="rgba(168,85,247,0.6)"
            strokeWidth="2"
          />
        </svg>

        {/* Sector icons & labels — these rotate with the wheel */}
        {SECTORS.map((sector, i) => {
          const labelAngle = i * 45;
          const iconPos = polarToCartesian(CX - 4, CY - 4, ICON_R, labelAngle);
          const textPos = polarToCartesian(CX - 4, CY - 4, LABEL_R - 14, labelAngle);
          return (
            <div
              key={sector.id}
              className="absolute pointer-events-none"
              style={{
                left: `${iconPos.x + 4}px`,
                top: `${iconPos.y + 4}px`,
                transform: "translate(-50%,-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <div
                className="relative"
                style={{ filter: `drop-shadow(0 0 6px ${sector.textColor}90)` }}
              >
                {sector.icon}
                {sector.badge}
              </div>
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: sector.textColor,
                  textTransform: "uppercase",
                  lineHeight: 1,
                  textShadow: `0 0 8px ${sector.textColor}80`,
                  whiteSpace: "nowrap",
                }}
              >
                {sector.label}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Center emblem (static, above wheel) */}
      <div
        style={{
          position: "absolute",
          width: "calc(var(--wheel-size) * 0.32)",
          height: "calc(var(--wheel-size) * 0.32)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 40% 35%,rgba(168,85,247,0.25) 0%,rgba(20,0,40,0.98) 70%)",
          border: "3px solid rgba(168,85,247,0.6)",
          boxShadow:
            "0 0 30px rgba(168,85,247,0.6), 0 0 60px rgba(168,85,247,0.2), inset 0 0 20px rgba(168,85,247,0.15)",
        }}
      >
        {/* P logo */}
        <span
          style={{
            fontSize: "clamp(34px,4.2vw,48px)",
            fontWeight: 900,
            color: "#a855f7",
            lineHeight: 1,
            textShadow: "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.4)",
            fontFamily: "system-ui,sans-serif",
            letterSpacing: "-0.04em",
          }}
        >
          P
        </span>
      </div>

      {/* Top pointer / indicator */}
      <div
        style={{
          position: "absolute",
          top: "calc(var(--wheel-size) * -0.014)",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 20
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "clamp(7px,0.9vw,10px) solid transparent",
            borderRight: "clamp(7px,0.9vw,10px) solid transparent",
            borderTop: "clamp(14px,1.8vw,20px) solid #a855f7",
            filter: "drop-shadow(0 0 8px rgba(168,85,247,0.9))",
          }}
        />
      </div>
    </div>
  );
}
