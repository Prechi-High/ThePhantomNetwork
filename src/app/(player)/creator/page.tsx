"use client";

import { useState } from "react";
import {
  HeroFocus,
  ListRow,
  PageShell,
  PrimaryCTA,
  SectionLabel,
  StatPill,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

export default function CreatorPage() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <PageShell className="space-y-6">
      <PlayerPageHeader username="Creator" />

      <HeroFocus
        eyebrow="Creator Hub"
        title="Record. Share. Recruit."
        subtitle="Gameplay creates content. Content attracts players. Legacy grows."
      >
        <PrimaryCTA onClick={() => {}}>Record session replay</PrimaryCTA>
      </HeroFocus>

      <div className="grid grid-cols-3 gap-2">
        <StatPill label="CIP" value="—" accent="blue" />
        <StatPill label="Referrals" value="—" accent="gold" />
        <StatPill label="Influence" value="—" accent="emerald" />
      </div>

      <section className="space-y-2">
        <SectionLabel>Share & grow</SectionLabel>
        <ListRow title="Download clip" subtitle="Watermark + outro card" />
        <ListRow
          title="Creator analytics"
          subtitle="Strategist rank required"
          onClick={() => setAnalyticsOpen(true)}
        />
        <ListRow
          title="Internal feed"
          subtitle="Publishing unlocks at Strategist"
        />
      </section>

      <section className="rounded-xl border border-legacy-divider bg-legacy-card p-4 text-xs text-legacy-muted">
        Referral milestones: 5 frame · 10 Legacy Coin · 25 emotes · 50 effect · 100 badge · 250 banner · 500 title.
        Legacy Influence cannot be purchased.
      </section>

      <BottomSheet open={analyticsOpen} onOpenChange={setAnalyticsOpen} title="Creator analytics">
        <p className="text-sm text-legacy-muted mb-4">
          Views, watch time, shares, referral installs, and CIP — available after Strategist promotion.
        </p>
        <Button className="w-full" variant="secondary" onClick={() => setAnalyticsOpen(false)}>
          Close
        </Button>
      </BottomSheet>
    </PageShell>
  );
}
