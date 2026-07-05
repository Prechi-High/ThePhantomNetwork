// Design tokens derived from reference image
// Color palette
export const colors = {
  bg: "#06030f",
  bgDeep: "#04020a",
  purple: {
    neon: "#a855f7",
    bright: "#c084fc",
    mid: "#7c3aed",
    deep: "#4c1d95",
    glow: "rgba(168,85,247,0.6)",
    glowSoft: "rgba(168,85,247,0.25)",
    border: "rgba(168,85,247,0.35)",
    borderBright: "rgba(168,85,247,0.7)",
    surface: "rgba(88,28,135,0.25)",
    surfaceDeep: "rgba(49,7,70,0.6)",
  },
  gold: {
    bright: "#f59e0b",
    mid: "#d97706",
    deep: "#92400e",
    rim: "#fbbf24",
    glow: "rgba(245,158,11,0.7)",
    glowSoft: "rgba(245,158,11,0.3)",
    text: "#fcd34d",
  },
  green: {
    neon: "#22c55e",
    bright: "#4ade80",
    glow: "rgba(34,197,94,0.6)",
    border: "rgba(34,197,94,0.4)",
    surface: "rgba(20,83,45,0.3)",
  },
  blue: {
    neon: "#38bdf8",
    bright: "#7dd3fc",
    glow: "rgba(56,189,248,0.6)",
    border: "rgba(56,189,248,0.4)",
    surface: "rgba(7,89,133,0.3)",
  },
  red: {
    neon: "#ef4444",
    bright: "#f87171",
    glow: "rgba(239,68,68,0.6)",
    border: "rgba(239,68,68,0.4)",
    surface: "rgba(127,29,29,0.3)",
  },
  white: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",
  glass: "rgba(15,5,30,0.65)",
  glassBright: "rgba(20,8,40,0.75)",
};

// Typography scale
export const type = {
  prize: { size: "22px", weight: "900", tracking: "-0.01em" },
  timer: { size: "36px", weight: "900", tracking: "0.04em" },
  phase: { size: "13px", weight: "800", tracking: "0.12em" },
  rank: { size: "22px", weight: "900", tracking: "-0.01em" },
  label: { size: "9px", weight: "700", tracking: "0.15em" },
  tokens: { size: "26px", weight: "900", tracking: "-0.01em" },
  skillName: { size: "9px", weight: "700", tracking: "0.08em" },
  feedText: { size: "11px", weight: "600", tracking: "0" },
  feedTime: { size: "9px", weight: "500", tracking: "0" },
};

// Spacing
export const space = {
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
};

// Border radius
export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
};
