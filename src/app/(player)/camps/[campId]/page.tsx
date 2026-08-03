"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  EmblemAvatar,
  HeroFocus,
  PageShell,
  SectionLabel,
  StatPill,
} from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { campsNetwork } from "@/lib/network";

export default function CampDetailPage() {
  const { campId } = useParams<{ campId: string }>();
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    campsNetwork.getCamp(campId).then((res) => {
      if (res.ok) setCamp((res.data as { camp?: Record<string, unknown> }).camp ?? null);
    }).finally(() => setLoading(false));
  }, [campId]);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (!camp) {
    return (
      <PageShell>
        <ScreenState variant="error" message="Camp not found" />
      </PageShell>
    );
  }

  const name = String(camp.name ?? "Camp");

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow="Official emblem"
        title={name}
        subtitle="Treasury · Projects · Legacy War qualification"
      >
        <div className="mt-4 flex justify-center">
          <EmblemAvatar alt={name} size="lg" emblem />
        </div>
      </HeroFocus>

      <div className="grid grid-cols-2 gap-2">
        <StatPill label="Members" value={Number(camp.member_count ?? 0)} accent="blue" />
        <StatPill label="Influence" value={Number(camp.leaderboard_score ?? 0)} accent="gold" />
      </div>

      <section className="space-y-2">
        <SectionLabel>Treasury</SectionLabel>
        <div className="rounded-xl border border-legacy-divider bg-legacy-card p-4 text-sm text-legacy-muted">
          80% Camp / 20% Squad from the 5% session camp pool. Leaders may withdraw up to 10% seasonally after governance.
        </div>
      </section>

      <section className="space-y-2">
        <SectionLabel>Legacy War</SectionLabel>
        <div className="rounded-xl border border-legacy-gold/25 bg-legacy-card p-4 text-sm text-white">
          All camps qualify. Season performance sets seeding. War every 90 days.
        </div>
      </section>
    </PageShell>
  );
}
