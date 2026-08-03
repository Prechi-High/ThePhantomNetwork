/**
 * Overlay registry — Master Screen Architecture Parts 6–11.
 * Sheets/modals are hosted inline on route pages via BottomSheet / Dialog.
 * IDs are the contract; SHEET_HOSTS documents where each is wired.
 */

export const BOTTOM_SHEETS = [
  "deposit",
  "withdraw",
  "join-session",
  "purchase-item",
  "promotion",
  "camp-funding",
  "squad-invite",
  "create-squad",
  "create-camp",
  "share-replay",
  "creator-analytics",
  "notifications",
  "filters",
  "edit-profile",
  "treasury",
] as const;

export const MODALS = [
  "insufficient-balance",
  "insufficient-tokens",
  "promotion",
  "leave-squad",
  "leave-camp",
  "season-end",
  "legacy-war",
  "session-cancelled",
  "reward-ready",
  "camp-takeover",
] as const;

export const OVERLAYS = [
  "countdown",
  "recording",
  "voice-active",
  "searching-players",
  "connection-lost",
  "replay-saved",
] as const;

export const POPUPS = [
  "token-gain",
  "influence-gain",
  "shield-activated",
  "new-session",
  "funding-complete",
] as const;

/** Route hosts for bottom sheets currently wired in the player UI. */
export const SHEET_HOSTS: Partial<Record<(typeof BOTTOM_SHEETS)[number], string>> = {
  deposit: "/profile",
  withdraw: "/profile",
  "edit-profile": "/profile",
  "join-session": "/sessions",
  filters: "/world/search",
  "create-squad": "/squads",
  "create-camp": "/camps",
  "share-replay": "/sessions/[sessionId]/results",
  "creator-analytics": "/creator",
};

export type BottomSheetId = (typeof BOTTOM_SHEETS)[number];
export type ModalId = (typeof MODALS)[number];
export type OverlayId = (typeof OVERLAYS)[number];
export type PopupId = (typeof POPUPS)[number];
