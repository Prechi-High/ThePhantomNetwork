"use client";

import { useEffect } from "react";
import { useLiveWorldStore } from "@/stores/useLiveWorldStore";
import { worldNetwork } from "@/lib/network";

/** Subscribes to global live feed — network layer only, no fetch in UI components. */
export function useGlobalLiveFeed(): void {
  const { setEvents, addEvent } = useLiveWorldStore();

  useEffect(() => {
    void worldNetwork.getLiveFeed().then((result) => {
      if (result.ok) {
        const data = result.data as { events?: Parameters<typeof setEvents>[0] };
        if (data.events) setEvents(data.events);
      }
    });

    const es = new EventSource("/api/live-feed/stream");
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as {
          eventType?: string;
          message?: string;
        };
        addEvent({
          id: crypto.randomUUID(),
          event_type: event.eventType ?? "update",
          message: event.message ?? "",
          created_at: new Date().toISOString(),
        });
      } catch {
        // ignore malformed events
      }
    };
    return () => es.close();
  }, [setEvents, addEvent]);
}
