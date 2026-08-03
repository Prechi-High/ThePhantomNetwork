"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InfluenceBar, KataBadge, ListRow, StatPill } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { getKataStage, MILESTONE_STAGES } from "@/lib/legacy/milestones";
import { authNetwork } from "@/lib/network";

export default function LegacyPage() {
  const [loading, setLoading] = useState(true);
  const [influence, setInfluence] = useState(0);
  const [username, setUsername] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    authNetwork.getProfile().then((res) => {
      if (!res.ok) return;
      const body = res.data as { profile?: { username?: string; avatar_url?: string; legacy_influence?: number } };
      const p = body.profile;
      setUsername(p?.username ?? "Player");
      setAvatarUrl(p?.avatar_url ?? null);
      setInfluence(Number(p?.legacy_influence ?? 0));
    }).finally(() => setLoading(false));
  }, []);

  const stage = getKataStage(influence);
  const thresholds = MILESTONE_STAGES[stage.name];
  const nextThreshold = thresholds.promotionThreshold;

  if (loading) return <ScreenState variant="loading" />;

  return (
    <div className="space-y-6 pb-8">
      <PlayerPageHeader avatarUrl={avatarUrl} username={username} />
      <div className="text-center">
        <KataBadge stage={stage.name} stageNumber={stage.stageNumber} />
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Your Legacy</h1>
        <p className="mt-2 text-sm text-legacy-muted">Permanent progression — sessions end, Legacy remains.</p>
      </div>
      <InfluenceBar current={influence} nextThreshold={nextThreshold} />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Sessions" value="—" accent="blue" />
        <StatPill label="Victories" value="—" accent="gold" />
      </div>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-legacy-muted">Identity</h2>
        <ListRow title="Squad" subtitle="Your faction in battle" href="/squads" />
        <ListRow title="Camp" subtitle="Your civilization" href="/camps" />
        <ListRow title="Armory" subtitle="Prepare loadouts" href="/sessions/prepare" />
        <ListRow title="Shop" subtitle="Cosmetics & items" href="/shop" />
      </section>
      <Link href="/profile" className="block text-center text-sm text-legacy-blue hover:underline">
        View full profile →
      </Link>
    </div>
  );
}
