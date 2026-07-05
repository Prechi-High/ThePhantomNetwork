"use client";

interface LiveFeedEvent {
  id?: number;
  event_type?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

interface LiveFeedPeekProps {
  events: LiveFeedEvent[];
}

export function LiveFeedPeek({ events }: LiveFeedPeekProps) {
  return (
    <aside className="flex flex-col min-w-0">
      <div className="mb-1.5 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <p className="text-[8px] font-bold uppercase tracking-wider text-phantom-muted">LIVE FEED</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pb-2">
        {events.slice(0, 3).map((event, index) => (
          <div
            key={event.id || index}
            className="glass rounded-lg border border-phantom-border/50 px-2 py-1.5 text-[8px]"
          >
            <div className="flex items-center gap-1">
              {event.event_type === "steal" && <span className="text-purple-400">💜</span>}
              {event.event_type === "revive" && <span className="text-green-400">💚</span>}
              {event.event_type === "eliminate" && <span className="text-red-400">💀</span>}
              {event.event_type === "camp" && <span className="text-yellow-400">⭐</span>}
              {event.event_type === "advance" && <span className="text-green-400">✨</span>}
              <span className="font-semibold text-white truncate">
                {event.message || "New event"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
