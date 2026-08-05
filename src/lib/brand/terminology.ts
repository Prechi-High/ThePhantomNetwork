/**
 * CLASHPOINT — canonical brand terminology.
 * Internal slugs stay stable; UI reads display names from here.
 */

export const APP_NAME = "CLASHPOINT";
export const APP_TAGLINE = "Every decision becomes part of your story";
export const CURRENT_SEASON = 18;

export const CURRENCY = {
  session: "Session Tokens",
  legacy: "Legacy Credits",
  wallet: "Wallet Balance",
} as const;

/** Internal slug → user-facing tactical asset name */
export const TACTICAL_ASSETS: Record<string, string> = {
  shield: "Guardian",
  cloak: "Veil",
  ambush: "Counterstrike",
  counterstrike: "Counterstrike",
  hack: "Intercept",
  intercept: "Intercept",
  sabotage: "Disrupt",
  disrupt: "Disrupt",
  bounty: "Mark",
  mark: "Mark",
  steal: "Steal",
  // Legacy slugs (squad-only, hidden in solo)
  insurance: "Insurance",
  steal_boost: "Steal Boost",
  shield_boost: "Shield Boost",
  revive: "Revive",
  multiplier: "Multiplier",
};

export const TACTICAL_DESCRIPTIONS: Record<string, string> = {
  guardian: "Protect yourself from one incoming attack before protection expires.",
  veil: "Hide or reduce your visibility for a limited duration.",
  counterstrike: "Reverse the next successful incoming attack if triggered before the timer expires.",
  intercept: "Steal one tactical asset from another player.",
  disrupt: "Reduce an opponent's effectiveness for a short period.",
  mark: "Mark a player as the primary target for bonus rewards.",
  steal: "Steal session tokens from a targeted opponent.",
};

export const MESSAGES = {
  victory: "Legacy Forged",
  squadVictory: "Your Squad Strengthened Its Legacy",
  legacyRecord: "Your Name Has Been Added To Today's Legacy Record",
  historyWritten: "History Has Been Written",
  defeat: "Legacy Interrupted",
  sessionComplete: "Session Complete",
  enterBattle: "ENTER BATTLE",
  armory: "Armory",
  prepareForBattle: "Prepare for Battle",
} as const;

export const LIVE_FEED_TEMPLATES = {
  guardianActivated: (name: string) => `${name} activated Guardian`,
  guardianBlocked: (name: string) => `${name} blocked a Steal`,
  counterstrikeActivated: (name: string) => `${name} activated Counterstrike`,
  counterstrikeTriggered: (name: string) => `${name} countered an attack`,
  interceptSuccess: (name: string) => `${name} intercepted enemy resources`,
  disruptInitiated: (name: string) => `${name} initiated Disruption`,
  markPlaced: (name: string) => `${name} marked a target`,
  veilActivated: (name: string) => `${name} activated Veil`,
  rankUp: (name: string, rank: number) => `${name} reached Rank ${rank}`,
  topTen: (name: string) => `${name} entered Top 10`,
  stealReady: (name: string) => `${name} has Steal Ready`,
  playerJoined: (name: string) => `${name} entered the session`,
} as const;

/** Map legacy DB slug to display slug */
export const SLUG_ALIASES: Record<string, string> = {
  shield: "guardian",
  cloak: "veil",
  ambush: "counterstrike",
  hack: "intercept",
  sabotage: "disrupt",
  bounty: "mark",
};

export function getAssetDisplayName(slug: string): string {
  const normalized = slug.toLowerCase().replace(/-/g, "_");
  return TACTICAL_ASSETS[normalized] ?? TACTICAL_ASSETS[SLUG_ALIASES[normalized] ?? ""] ?? slug;
}

export function getAssetDescription(slug: string): string {
  const key = SLUG_ALIASES[slug.toLowerCase()] ?? slug.toLowerCase();
  return TACTICAL_DESCRIPTIONS[key] ?? "";
}
