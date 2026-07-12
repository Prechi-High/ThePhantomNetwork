/**
 * World Events — Global Ecosystem Events
 *
 * Periodic events that affect everyone simultaneously.
 * Creates shared experiences: "The world evolves."
 *
 * Events:
 *   double_tokens      — 2× token rewards
 *   camp_war           — camps compete for territory
 *   revive_challenge   — bonus for reviving others
 *   surge_festival     — Shadow Surge triggers faster
 *   legend_hunt        — hunt for a player bounty
 *   championship_week  — elevated championship prizes
 *   squad_spotlight    — featured squad of the week
 */

export type WorldEventId =
  | "double_tokens"
  | "camp_war"
  | "revive_challenge"
  | "surge_festival"
  | "legend_hunt"
  | "championship_week"
  | "squad_spotlight"
  | "daily_featured";

export type WorldEventStatus = "upcoming" | "active" | "ending" | "completed";

export interface WorldEvent {
  id: string;
  eventType: WorldEventId;
  title: string;
  description: string;
  startsAt: number;
  endsAt: number;
  status: WorldEventStatus;
  /** Gameplay modifier (e.g. 2.0 for double tokens) */
  modifier?: number;
  /** Featured entity (camp, squad, player) */
  featured?: { id: string; name: string; type: "camp" | "squad" | "player" };
  /** Challenge objective */
  objective?: string;
  /** Current progress 0–1 (for challenges) */
  progress?: number;
}

const EVENT_TEMPLATES: Record<WorldEventId, Omit<WorldEvent, "id" | "startsAt" | "endsAt" | "status">> = {
  double_tokens: {
    eventType:   "double_tokens",
    title:       "Double Tokens",
    description: "All token rewards are doubled this weekend",
    modifier:    2.0,
  },
  camp_war: {
    eventType:   "camp_war",
    title:       "Camp War Week",
    description: "Camps compete for territorial dominance",
  },
  revive_challenge: {
    eventType:   "revive_challenge",
    title:       "Revive Challenge",
    description: "Revive teammates to earn bonus tokens",
    objective:   "Complete 100 revives as a community",
  },
  surge_festival: {
    eventType:   "surge_festival",
    title:       "Shadow Surge Festival",
    description: "Shadow Surge fills 50% faster for all players",
    modifier:    1.5,
  },
  legend_hunt: {
    eventType:   "legend_hunt",
    title:       "Legend Hunt",
    description: "One player is the target — eliminate them for glory",
  },
  championship_week: {
    eventType:   "championship_week",
    title:       "Championship Week",
    description: "Championship prize pools are elevated this week",
    modifier:    1.25,
  },
  squad_spotlight: {
    eventType:   "squad_spotlight",
    title:       "Squad Spotlight",
    description: "This squad earned special recognition",
  },
  daily_featured: {
    eventType:   "daily_featured",
    title:       "Daily Feature",
    description: "Today's featured activity",
  },
};

// ── World Events Manager ──────────────────────────────────────────────────

export class WorldEventsManager {
  private events: WorldEvent[] = [];
  private listeners: Set<(events: WorldEvent[]) => void> = new Set();

  createEvent(
    type: WorldEventId,
    startsAt: number,
    endsAt: number,
    overrides?: Partial<WorldEvent>,
  ): WorldEvent {
    const template = EVENT_TEMPLATES[type];
    const event: WorldEvent = {
      id:       `evt-${type}-${startsAt}`,
      startsAt,
      endsAt,
      status:   Date.now() < startsAt ? "upcoming" : Date.now() < endsAt ? "active" : "completed",
      ...template,
      ...overrides,
    };
    this.events.unshift(event);
    this.notifyListeners();
    return event;
  }

  /** Compute statuses based on current time */
  tick(): void {
    const now = Date.now();
    let changed = false;
    this.events = this.events.map((e) => {
      const status: WorldEventStatus =
        now < e.startsAt ? "upcoming"
        : now < e.endsAt - 1_800_000 ? "active"  // last 30min = ending
        : now < e.endsAt ? "ending"
        : "completed";
      if (status !== e.status) { changed = true; return { ...e, status }; }
      return e;
    });
    if (changed) this.notifyListeners();
  }

  getActive(): WorldEvent[] {
    return this.events.filter((e) => e.status === "active" || e.status === "ending");
  }

  getUpcoming(): WorldEvent[] {
    return this.events.filter((e) => e.status === "upcoming");
  }

  getCurrent(): WorldEvent | undefined {
    return this.events.find((e) => e.status === "active");
  }

  getAll(): WorldEvent[] { return [...this.events]; }

  setEvents(events: WorldEvent[]): void {
    this.events = events;
    this.notifyListeners();
  }

  /** Active modifier for token calculation */
  getTokenModifier(): number {
    const active = this.getActive();
    const doubleTokens = active.find((e) => e.eventType === "double_tokens");
    return doubleTokens?.modifier ?? 1.0;
  }

  onChange(fn: (events: WorldEvent[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notifyListeners(): void {
    const events = this.getActive();
    this.listeners.forEach((fn) => fn(events));
  }
}

export const worldEventsManager = new WorldEventsManager();
