"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ListRow } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";

export default function WorldSearchPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6 pb-8">
      <PlayerPageHeader />
      <Link href="/world" className="text-sm text-legacy-muted hover:text-white">← World</Link>
      <h1 className="font-display text-2xl font-bold text-white">Search & Discovery</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Players, squads, camps, creators…"
        className="w-full rounded-xl border border-legacy-border bg-legacy-card px-4 py-3 text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/50"
      />
      <Button variant="ghost" onClick={() => setFiltersOpen(true)}>Filters</Button>
      <section className="space-y-2">
        <ListRow title="Trending creators" subtitle="Strategist-ranked players" href="/creator" />
        <ListRow title="Top camps" subtitle="By Legacy War score" href="/camps" />
        <ListRow title="Rivalries" subtitle="Your targets" href="/rivals" />
      </section>
      <BottomSheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters">
        <p className="text-sm text-legacy-muted">Filter by type: Players, Squads, Camps, Creators.</p>
      </BottomSheet>
    </div>
  );
}
