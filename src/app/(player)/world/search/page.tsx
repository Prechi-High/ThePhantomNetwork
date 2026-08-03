"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ListRow, PageShell, HeroFocus, SectionLabel } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";

export default function WorldSearchPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <PageShell className="space-y-6">
      <PlayerPageHeader />
      <Link href="/world" className="text-sm text-legacy-muted hover:text-white">
        ← World
      </Link>
      <HeroFocus
        eyebrow="Discovery"
        title="Search"
        subtitle="Players, squads, camps, creators."
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the world…"
        className="w-full rounded-xl border border-legacy-divider bg-legacy-card px-4 py-3 text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40"
      />
      <Button variant="ghost" onClick={() => setFiltersOpen(true)}>
        Filters
      </Button>
      <section className="space-y-2">
        <SectionLabel>Quick discover</SectionLabel>
        <ListRow title="Trending creators" subtitle="Strategist-ranked" href="/creator" />
        <ListRow title="Top camps" subtitle="Legacy War seeding" href="/camps" />
        <ListRow title="Rivalries" subtitle="Your targets" href="/world" />
        {query.trim() && (
          <p className="text-sm text-legacy-muted">Searching for “{query}”…</p>
        )}
      </section>
      <BottomSheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters">
        <p className="text-sm text-legacy-muted">Players · Squads · Camps · Creators</p>
      </BottomSheet>
    </PageShell>
  );
}
