/**
 * useLiveFeedStore — The World's Memory
 *
 * Domain: World activity and announcements.
 * Owns: all live feed events, global announcements, priority pins,
 *       world activity stream, historical buffer (100 events).
 * Never owns: gameplay state, session logic, player stats.
 *
 * This is one of the most psychologically important stores.
 * It continuously reinforces: "The world exists beyond you."
 *
 * Independent failure — gameplay continues if feed is delayed.
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export type FeedEventType =
  | "steal"
  | "revive"
  | "elimination"
  | "phase"
  | "effect"
  | "lead"
  | "surge"
  // World presence events
  | "player_joined"
  | "squad_created"
  | "camp_overtaken"
  | "new_champion"
  | "huge_win"
  | "new_rival"
  | "session_started"
  | "session_finished"
  | "rank_milestone"
  | "announcement";

export type FeedEventPriority = "critical" | "high" | "normal" | "low";

export interface FeedEventActor {
  user_id: string;
  username: string;
  avatar: string;
}

export interface FeedEventTarget {
  user_id: string;
  username: string;
}

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  priority?: FeedEventPriority;
  timestamp: string;
  actor: FeedEventActor;
  target?: FeedEventTarget;
  details: Record<string, unknown>;
  pinned?: boolean;
  seen?: boolean;
}

// ── State ──────────────────────────────────────────────────────────────────

interface LiveFeedStoreState {
  /** Active feed — max 100 events */
  events: FeedEvent[];
  /** Events pinned to top (critical / high priority) — cleared after 8s */
  pinnedEvents: FeedEvent[];
  /** Unread event count (for badge) */
  unreadCount: number;
  /** Last event timestamp */
  lastEventAt: number | null;
}

// ── Actions ────────────────────────────────────────────────────────────────

interface LiveFeedStoreActions {
  // Add events
  addEvent:  (event: FeedEvent) => void;
  setEvents: (events: FeedEvent[]) => void;

  // Pin management (critical events that appear briefly)
  pinEvent:   (eventId: string) => void;
  unpinEvent: (eventId: string) => void;
  clearPins:  () => void;

  // Read state
  markSeen:  (eventId: string) => void;
  markAllSeen: () => void;

  // Queries
  getByType:     (type: FeedEventType, limit?: number) => FeedEvent[];
  getHighPriority: (limit?: number) => FeedEvent[];
  getWorldEvents:  (limit?: number) => FeedEvent[];

  // Lifecycle
  removeOldestEvent: () => void;
  trimToLimit:       (limit?: number) => void;
  clear: () => void;
}

type LiveFeedStore = LiveFeedStoreState & LiveFeedStoreActions;

// ── Priority → auto-pin threshold ─────────────────────────────────────────

const AUTO_PIN_PRIORITIES: FeedEventPriority[] = ["critical", "high"];

// ── Store ──────────────────────────────────────────────────────────────────

export const useLiveFeedStore = create<LiveFeedStore>((set, get) => ({
  events:        [],
  pinnedEvents:  [],
  unreadCount:   0,
  lastEventAt:   null,

  // ---- Add events ----

  addEvent: (event) =>
    set((s) => {
      const newEvents = [event, ...s.events].slice(0, 100);
      const shouldPin = event.priority && AUTO_PIN_PRIORITIES.includes(event.priority);
      const pinnedEvents = shouldPin
        ? [{ ...event, pinned: true }, ...s.pinnedEvents].slice(0, 3)
        : s.pinnedEvents;

      return {
        events: newEvents,
        pinnedEvents,
        unreadCount: s.unreadCount + 1,
        lastEventAt: Date.now(),
      };
    }),

  setEvents: (events) =>
    set({
      events: events.slice(0, 100),
      lastEventAt: Date.now(),
    }),

  // ---- Pins ----

  pinEvent: (eventId) =>
    set((s) => {
      const event = s.events.find(e => e.id === eventId);
      if (!event) return s;
      return {
        pinnedEvents: [{ ...event, pinned: true }, ...s.pinnedEvents].slice(0, 3),
      };
    }),

  unpinEvent: (eventId) =>
    set((s) => ({
      pinnedEvents: s.pinnedEvents.filter(e => e.id !== eventId),
    })),

  clearPins: () => set({ pinnedEvents: [] }),

  // ---- Read state ----

  markSeen: (eventId) =>
    set((s) => ({
      events: s.events.map(e => e.id === eventId ? { ...e, seen: true } : e),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllSeen: () =>
    set((s) => ({
      events: s.events.map(e => ({ ...e, seen: true })),
      unreadCount: 0,
    })),

  // ---- Queries ----

  getByType: (type, limit = 10) =>
    get().events.filter(e => e.type === type).slice(0, limit),

  getHighPriority: (limit = 5) =>
    get().events
      .filter(e => e.priority === "critical" || e.priority === "high")
      .slice(0, limit),

  getWorldEvents: (limit = 20) =>
    get().events
      .filter(e => [
        "player_joined", "squad_created", "camp_overtaken",
        "new_champion", "huge_win", "session_started",
        "session_finished", "rank_milestone", "announcement",
      ].includes(e.type))
      .slice(0, limit),

  // ---- Lifecycle ----

  removeOldestEvent: () =>
    set((s) => ({ events: s.events.slice(0, s.events.length - 1) })),

  trimToLimit: (limit = 100) =>
    set((s) => ({ events: s.events.slice(0, limit) })),

  clear: () =>
    set({ events: [], pinnedEvents: [], unreadCount: 0, lastEventAt: null }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectFeedEvents    = (s: LiveFeedStore) => s.events;
export const selectPinnedEvents  = (s: LiveFeedStore) => s.pinnedEvents;
export const selectUnreadCount   = (s: LiveFeedStore) => s.unreadCount;
export const selectRecentEvents  = (limit = 6) => (s: LiveFeedStore) => s.events.slice(0, limit);
