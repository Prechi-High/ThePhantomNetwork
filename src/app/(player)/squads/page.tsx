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
import { squadsNetwork } from "@/lib/network";

interface SquadRow {
  id: string;
  name: string;
  member_count?: number;
  motto?: string;
  emblem_id?: string;
}

export default function SquadsPage() {
  const [loading, setLoading] = useState(true);
  const [squads, setSquads] = useState<SquadRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    squadsNetwork.listSquads().then((res) => {
      if (res.ok) {
        const d = res.data as { squads?: SquadRow[] };
        setSquads(d.squads ?? []);
      }
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
        eyebrow="Squad"
        title="Your family in battle"
        subtitle="Max 15 members. Official emblem only. Inactive 7 days → removed."
      >
        <Button className="mt-2 w-full" variant="secondary" onClick={() => setCreateOpen(true)}>
          Create squad
        </Button>
      </HeroFocus>

      <section className="space-y-2">
        <SectionLabel>Squads</SectionLabel>
        {squads.length === 0 ? (
          <ScreenState
            variant="empty"
            title="No squad yet"
            message="Unlocked at Squad Master milestone."
          />
        ) : (
          squads.map((s) => (
            <ListRow
              key={s.id}
              title={s.name}
              subtitle={`${s.member_count ?? 0}/15 · ${s.motto ?? "No motto"}`}
              href={`/squads/${s.id}`}
              trailing={<EmblemAvatar alt={s.name} size="sm" emblem />}
            />
          ))
        )}
      </section>

      <BottomSheet open={createOpen} onOpenChange={setCreateOpen} title="Create Squad">
        <p className="mb-4 text-sm text-legacy-muted">
          Requires Squad Master promotion, creation token cost, name, motto, and an official 3D emblem.
        </p>
        <Button className="w-full" onClick={() => setCreateOpen(false)}>
          Understood
        </Button>
      </BottomSheet>
    </PageShell>
  );
}
