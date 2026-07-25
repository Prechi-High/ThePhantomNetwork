/**
 * Tactical asset definitions for LEGACIES Armory.
 */

import type { TacticalAssetSlug } from "@/types/gameplay";

export interface TacticalAssetDef {
  slug: TacticalAssetSlug;
  displayName: string;
  description: string;
  defaultPrice: number;
  durationMs: number;
  requiresTarget: boolean;
  icon: string;
  /** Maps to sub_session_players field when applicable */
  legacyField?: "shield_count" | "cloak";
}

export const TACTICAL_ASSET_DEFS: Record<TacticalAssetSlug, TacticalAssetDef> = {
  guardian: {
    slug: "guardian",
    displayName: "Guardian",
    description: "Protect yourself from one incoming attack before protection expires.",
    defaultPrice: 120,
    durationMs: 30_000,
    requiresTarget: false,
    icon: "🛡",
    legacyField: "shield_count",
  },
  veil: {
    slug: "veil",
    displayName: "Veil",
    description: "Hide or reduce your visibility for a limited duration.",
    defaultPrice: 180,
    durationMs: 60_000,
    requiresTarget: false,
    icon: "👤",
    legacyField: "cloak",
  },
  counterstrike: {
    slug: "counterstrike",
    displayName: "Counterstrike",
    description: "Reverse the next successful incoming attack if triggered before the timer expires.",
    defaultPrice: 300,
    durationMs: 30_000,
    requiresTarget: false,
    icon: "⚔",
  },
  intercept: {
    slug: "intercept",
    displayName: "Intercept",
    description: "Steal one tactical asset from another player.",
    defaultPrice: 250,
    durationMs: 0,
    requiresTarget: true,
    icon: "📡",
  },
  disrupt: {
    slug: "disrupt",
    displayName: "Disrupt",
    description: "Reduce an opponent's effectiveness for a short period.",
    defaultPrice: 220,
    durationMs: 45_000,
    requiresTarget: true,
    icon: "⚡",
  },
  mark: {
    slug: "mark",
    displayName: "Mark",
    description: "Mark a player as the primary target for bonus rewards.",
    defaultPrice: 160,
    durationMs: 60_000,
    requiresTarget: true,
    icon: "🎯",
  },
};

export const TACTICAL_ASSET_SLUGS = Object.keys(TACTICAL_ASSET_DEFS) as TacticalAssetSlug[];

export function normalizeAssetSlug(slug: string): TacticalAssetSlug | null {
  const map: Record<string, TacticalAssetSlug> = {
    shield: "guardian",
    guardian: "guardian",
    cloak: "veil",
    veil: "veil",
    ambush: "counterstrike",
    counterstrike: "counterstrike",
    hack: "intercept",
    intercept: "intercept",
    sabotage: "disrupt",
    disrupt: "disrupt",
    bounty: "mark",
    mark: "mark",
  };
  return map[slug.toLowerCase()] ?? null;
}
