"use client";

import { useEffect, useState } from "react";
import {
  HeroFocus,
  InfluenceBar,
  KataBadge,
  ListRow,
  PageShell,
  SectionLabel,
  StatPill,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { getKataStage, MILESTONE_STAGES } from "@/lib/legacy/milestones";
import { authNetwork } from "@/lib/network";

const PATHFINDER_REQUIREMENTS = [
  "Complete 50 sessions",
  "Win 15 sessions",
  "Revive teammates 25 times",
  "30 sessions without quitting early",
  "Invite 3 active players",
  "Active on 14 different days",
];

export default function LegacyPage() {
  const [loading, setLoading] = useState(true);
  const [influence, setInfluence] = useState(0);
  const [username, setUsername] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    authNetwork.getProfile().then((res) => {
      if (res.ok) {
        const body = res.data as {
          profile?: { username?: string; avatar_url?: string; legacy_influence?: number };
        };
        const p = body.profile;
        setUsername(p?.username ?? "Player");
        setAvatarUrl(p?.avatar_url ?? null);
        setInfluence(Number(p?.legacy_influence ?? 0));
      }
    }).finally(() => setLoading(false));
  }, []);

  const stage = getKataStage(influence);
  const nextThreshold = MILESTONE_STAGES[stage.name].promotionThreshold;

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PlayerPageHeader avatarUrl={avatarUrl} username={username} />

      <HeroFocus
        eyebrow="Permanent progression"
        title="Your Legacy"
        subtitle="Sessions end. Legacy remains. Influence cannot be bought."
      >
        <div className="mt-4 flex justify-center">
          <KataBadge stage={stage.name} stageNumber={stage.stageNumber} />
        </div>
        <div className="mx-auto mt-4 max-w-sm">
          <InfluenceBar current={influence} nextThreshold={nextThreshold} />
        </div>
      </HeroFocus>

      <div className="grid grid-cols-2 gap-2">
        <StatPill label="Kata" value={stage.name} accent="gold" />
        <StatPill label="Stage" value={stage.stageNumber} accent="blue" />
      </div>

      <section className="space-y-2">
        <SectionLabel>Promotion path (Pathfinder)</SectionLabel>
        <ul className="space-y-1 rounded-xl border border-legacy-divider bg-legacy-card p-4 text-xs text-legacy-muted">
          {PATHFINDER_REQUIREMENTS.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
        <p className="text-[10px] text-legacy-muted">
          Strategist and Legacy requirements stay locked until eligible.
        </p>
      </section>

      <section className="space-y-2">
        <SectionLabel>Identity</SectionLabel>
        <ListRow title="Squad" subtitle="Your faction in battle" href="/squads" />
        <ListRow title="Camp" subtitle="Your civilization" href="/camps" />
        <ListRow title="Cosmetics" subtitle="Shop & prestige" href="/shop" />
        <ListRow title="Profile" subtitle="Story & badges" href="/profile" />
      </section>
    </PageShell>
  );
}
