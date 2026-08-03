/** LEGACIES V5 — canonical design tokens (Design System spec) */

export const colors = {
  background: "#0B0F14",
  surface: "#131922",
  card: "#1B2230",
  divider: "#2A3447",
  legacyGold: "#F5B942",
  phantomBlue: "#4C8DFF",
  emerald: "#39D98A",
  amber: "#F5A623",
  crimson: "#E64D5E",
  muted: "#64748b",
  text: "#f1f5f9",
} as const;

export const spacing = {
  unit: 8,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export const typography = {
  fontFamily: "Manrope, system-ui, sans-serif",
  fontDisplay: "Manrope, system-ui, sans-serif",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const shadows = {
  soft: "0 4px 24px rgba(0, 0, 0, 0.35)",
  card: "0 8px 32px rgba(0, 0, 0, 0.37)",
  goldGlow: "0 0 30px rgba(245, 185, 66, 0.45)",
} as const;

export const navTabs = [
  { href: "/home", label: "Home" },
  { href: "/sessions", label: "Sessions" },
  { href: "/world", label: "World" },
  { href: "/creator", label: "Creator" },
  { href: "/legacy", label: "Legacy" },
] as const;
