"use client";

import { useLiveWorldStore } from "@/stores/useLiveWorldStore";
import { useGlobalLiveFeed } from "@/hooks/useGlobalLiveFeed";

export function GlobalLiveFeed() {
  useGlobalLiveFeed();
  const events = useLiveWorldStore((s) => s.events);

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
