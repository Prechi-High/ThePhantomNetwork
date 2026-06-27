"use client";

import { useEffect } from "react";
import { useLiveWorldStore } from "@/stores/useLiveWorldStore";

export function LiveFeed() {
  const { events, setEvents, addEvent } = useLiveWorldStore();

  useEffect(() => {
    fetch("/api/live-feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch(() => {});

    const es = new EventSource("/api/live-feed/stream");
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        addEvent({
          id: crypto.randomUUID(),
          event_type: event.eventType,
          message: event.message,
          created_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    };
    return () => es.close();
  }, [setEvents, addEvent]);

  if (events.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-phantom-border bg-phantom-surface/50 py-1.5">
      <div className="animate-marquee whitespace-nowrap text-xs text-phantom-muted">
        {events.slice(0, 10).map((e, i) => (
          <span key={i} className="mx-6">
            <span className="text-phantom-gold">◆</span> {e.message}
          </span>
        ))}
      </div>
    </div>
  );
}
