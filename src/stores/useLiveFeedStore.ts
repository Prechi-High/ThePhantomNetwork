import { create } from 'zustand';

interface FeedEvent {
  id: string;
  type: 'steal' | 'revive' | 'elimination' | 'phase' | 'effect' | 'lead' | 'surge';
  timestamp: string;
  actor?: {
    id: string;
    username: string;
  };
  target?: {
    id: string;
    username: string;
  };
  details?: Record<string, unknown>;
}

interface LiveFeedStore {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  setEvents: (events: FeedEvent[]) => void;
  removeOldestEvent: () => void;
  clear: () => void;
}

const MAX_EVENTS = 50;

export const useLiveFeedStore = create<LiveFeedStore>((set) => ({
  events: [],

  addEvent: (event: FeedEvent) => {
    set((state) => {
      const updated = [event, ...state.events];
      // Keep only latest MAX_EVENTS
      if (updated.length > MAX_EVENTS) {
        return { events: updated.slice(0, MAX_EVENTS) };
      }
      return { events: updated };
    });
  },

  setEvents: (events: FeedEvent[]) => {
    set({ events: events.slice(0, MAX_EVENTS) });
  },

  removeOldestEvent: () => {
    set((state) => ({
      events: state.events.slice(0, -1),
    }));
  },

  clear: () => {
    set({ events: [] });
  },
}));
