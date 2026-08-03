"use client";

import { useEffect, useState } from "react";
import {
  EmblemAvatar,
  HeroFocus,
  ListRow,
  PageShell,
  SectionLabel,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { campsNetwork } from "@/lib/network";

interface CampRow {
  id: string;
  name: string;
  member_count?: number;
  referral_code?: string;
}

export default function CampsPage() {
  const [loading, setLoading] = useState(true);
  const [camps, setCamps] = useState<CampRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    campsNetwork.listCamps().then((res) => {
      if (res.ok) setCamps((res.data.camps ?? []) as CampRow[]);
    }).finally(() => setLoading(false));
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
      <PlayerPageHeader />

      <HeroFocus
        eyebrow="Camp"
        title="Long-term civilization"
        subtitle="Squads compete in sessions. Camps compete for history and Legacy Wars."
      >
        <Button className="mt-2 w-full" variant="secondary" onClick={() => setCreateOpen(true)}>
          Create camp
        </Button>
      </HeroFocus>

      <section className="rounded-xl border border-legacy-gold/20 bg-legacy-card p-4 text-sm text-legacy-muted">
        Camp reward pool: 5% of every official session → 80% Camp Treasury / 20% Squad Treasury.
        Legacy War reserve: +5% every session.
      </section>

      <section className="space-y-2">
        <SectionLabel>Camps</SectionLabel>
        {camps.length === 0 ? (
          <ScreenState variant="empty" title="No camps" message="Unlocked at Camp Master." />
        ) : (
          camps.map((c) => (
            <ListRow
              key={c.id}
              title={c.name}
              subtitle={`${c.member_count ?? 0} members`}
              href={`/camps/${c.id}`}
              trailing={<EmblemAvatar alt={c.name} size="sm" emblem />}
            />
          ))
        )}
      </section>

      <BottomSheet open={createOpen} onOpenChange={setCreateOpen} title="Create Camp">
        <p className="mb-4 text-sm text-legacy-muted">
          Requires Camp Master promotion, Legacy Tokens, name, motto, and an official emblem from the curated library (~60).
        </p>
        <Button className="w-full" onClick={() => setCreateOpen(false)}>
          Understood
        </Button>
      </BottomSheet>
    </PageShell>
  );
}
