"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeroFocus,
  ListRow,
  PageShell,
  SectionLabel,
  StatPill,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { Button } from "@/components/ui/Button";
import { worldNetwork } from "@/lib/network";
import { LEGACY_WAR_CYCLE_DAYS } from "@/lib/economy/legacy-war";

interface Rival {
  id: string;
  intensity?: number;
  username?: string;
}

export default function WorldPage() {
  const [loading, setLoading] = useState(true);
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [feed, setFeed] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([worldNetwork.getRivals(), worldNetwork.getLiveFeed()]).then(
      ([rivalsRes, feedRes]) => {
        if (rivalsRes.ok) {
          const d = rivalsRes.data as { rivalries?: Rival[] };
          setRivals(d.rivalries ?? []);
        }
        if (feedRes.ok) {
          const events =
            (feedRes.data as { events?: Array<{ message?: string; type?: string }> }).events ?? [];
          setFeed(events.slice(0, 5).map((e) => e.message ?? e.type ?? "Activity"));
        }
      }
    ).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <div className="flex items-center justify-between">
        <PlayerPageHeader />
      </div>

      <HeroFocus
        eyebrow="Living world"
        title="Rankings & Rivalries"
        subtitle="Know the field. Track the War. Take your place."
      >
        <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-2">
          <StatPill label="War cycle" value={`${LEGACY_WAR_CYCLE_DAYS}d`} accent="amber" />
          <StatPill label="War reserve" value="5%" accent="gold" />
        </div>
        <Link href="/world/search" className="mt-4 inline-block">
          <Button variant="secondary" className="w-full">Search & Discovery</Button>
        </Link>
      </HeroFocus>

      <section className="rounded-xl border border-legacy-gold/25 bg-legacy-card p-4">
        <SectionLabel>Legacy War Reserve</SectionLabel>
        <p className="mt-2 text-sm text-white">
          5% of every official session funds the reserve. Contested every {LEGACY_WAR_CYCLE_DAYS} days.
        </p>
      </section>

      <section className="space-y-2">
        <SectionLabel>Live activity</SectionLabel>
        {feed.length === 0 ? (
          <p className="text-sm text-legacy-muted">The world is quiet — for now.</p>
        ) : (
          feed.map((t, i) => (
            <div key={i} className="rounded-xl border border-legacy-divider bg-legacy-surface px-4 py-3 text-sm text-legacy-muted">
              {t}
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <SectionLabel>Rivalries</SectionLabel>
        {rivals.length === 0 ? (
          <ScreenState variant="empty" title="No rivalries" message="Steal to create them." />
        ) : (
          rivals.map((r) => (
            <ListRow
              key={r.id}
              title={r.username ?? "Rival"}
              subtitle={`Intensity ${r.intensity ?? "—"}`}
            />
          ))
        )}
      </section>
    </PageShell>
  );
}
