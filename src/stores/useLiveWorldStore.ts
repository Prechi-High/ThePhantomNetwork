import { create } from "zustand";

interface FeedEvent {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
}

interface LiveWorldState {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  setEvents: (events: FeedEvent[]) => void;
}

export const useLiveWorldStore = create<LiveWorldState>((set) => ({
  events: [],
  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 50) })),
  setEvents: (events) => set({ events }),
}));
