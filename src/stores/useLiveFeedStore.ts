import { create } from 'zustand';

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
  type: 'steal' | 'revive' | 'elimination' | 'phase' | 'effect' | 'lead' | 'surge';
  timestamp: string;
  actor: FeedEventActor;
  target?: FeedEventTarget;
  details: Record<string, unknown>;
}

interface LiveFeedStore {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  removeOldestEvent: () => void;
  setEvents: (events: FeedEvent[]) => void;
  clear: () => void;
}

export const useLiveFeedStore = create<LiveFeedStore>((set) => ({
  events: [],

  addEvent: (event: FeedEvent) =>
    set((state) => {
      const newEvents = [event, ...state.events];
      // Keep max 50 events
      return { events: newEvents.slice(0, 50) };
    }),

  removeOldestEvent: () =>
    set((state) => {
      const newEvents = [...state.events];
      newEvents.pop();
      return { events: newEvents };
    }),

  setEvents: (events: FeedEvent[]) =>
    set({ events: events.slice(0, 50) }),

  clear: () => set({ events: [] }),
}));
