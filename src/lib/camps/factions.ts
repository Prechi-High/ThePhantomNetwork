/**
 * Faction camp display config — maps DB slugs to reference UI.
 */

export interface FactionCamp {
  slug: string;
  name: string;
  accent: string;
  accentGlow: string;
  emoji: string;
  defaultSelected?: boolean;
}

export const FACTION_CAMPS: FactionCamp[] = [
  {
    slug: "infernus",
    name: "Infernus",
    accent: "#E64D5E",
    accentGlow: "rgba(230, 77, 94, 0.45)",
    emoji: "🐉",
  },
  {
    slug: "northridge",
    name: "Northridge",
    accent: "#4C8DFF",
    accentGlow: "rgba(76, 141, 255, 0.45)",
    emoji: "🐺",
  },
  {
    slug: "solara",
    name: "Solara",
    accent: "#F5B942",
    accentGlow: "rgba(245, 185, 66, 0.55)",
    emoji: "🦅",
    defaultSelected: true,
  },
  {
    slug: "veridian",
    name: "Veridian",
    accent: "#39D98A",
    accentGlow: "rgba(57, 217, 138, 0.45)",
    emoji: "🌳",
  },
  {
    slug: "nocturis",
    name: "Nocturis",
    accent: "#A78BFA",
    accentGlow: "rgba(167, 139, 250, 0.45)",
    emoji: "🧭",
  },
];

export function getDefaultFaction(): FactionCamp {
  return FACTION_CAMPS.find((c) => c.defaultSelected) ?? FACTION_CAMPS[2];
}

export function getFactionBySlug(slug: string): FactionCamp | undefined {
  return FACTION_CAMPS.find((c) => c.slug === slug);
}
