"use client";

interface HomeWorldActivityFeedProps {
  items: string[];
}

export function HomeWorldActivityFeed({ items }: HomeWorldActivityFeedProps) {
  const feed = items.length
    ? items
    : ["Kingsmen joined Session #431", "Prize pool crossed $50,000", "New rivalry declared"];

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-3">
      <p className="mb-2 text-[9px] font-bold uppercase text-white/50">Live World Activity</p>
      <ul className="space-y-2">
        {feed.slice(0, 4).map((item, i) => (
          <li key={i} className="flex gap-2 text-[10px] text-white/70">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
