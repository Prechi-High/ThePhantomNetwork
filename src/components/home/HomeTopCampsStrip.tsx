"use client";

import { FACTION_CAMPS } from "@/lib/camps/factions";

interface CampMomentum {
  campName: string;
  campSlug?: string;
  momentum: number;
}

interface HomeTopCampsStripProps {
  camps: CampMomentum[];
}

export function HomeTopCampsStrip({ camps }: HomeTopCampsStripProps) {
  const total = camps.reduce((s, c) => s + c.momentum, 0) || 1;

  const rows = camps.length
    ? camps.slice(0, 5).map((c) => ({
        name: c.campName,
        emoji: FACTION_CAMPS.find((f) => f.slug === c.campSlug || f.name === c.campName)?.emoji ?? "⚔",
        pct: ((c.momentum / total) * 100).toFixed(1),
      }))
    : FACTION_CAMPS.map((f, i) => ({
        name: f.name,
        emoji: f.emoji,
        pct: [28.4, 22.1, 18.5, 16.0, 15.0][i]?.toFixed(1) ?? "10.0",
      }));

  return (
    <section className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Top Camps</p>
      <div className="flex justify-between gap-1">
        {rows.map((c) => (
          <div key={c.name} className="flex flex-1 flex-col items-center text-center">
            <span className="text-lg">{c.emoji}</span>
            <p className="text-[8px] font-bold uppercase text-white/60">{c.name}</p>
            <p className="text-[9px] font-bold text-[#f5b942]">{c.pct}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}
