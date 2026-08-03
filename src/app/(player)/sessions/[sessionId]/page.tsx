"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CountdownHero,
  HeroFocus,
  PageShell,
  PrimaryCTA,
  SectionLabel,
} from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { sessionNetwork } from "@/lib/network";
import { distributePrizePool } from "@/lib/economy/session-pool";

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{
    title: string;
    status: string;
    starts_at: string;
    entry_fee_cents: number;
    total_pool_cents: number;
    registered_count: number;
    max_players?: number;
  } | null>(null);

  useEffect(() => {
    sessionNetwork.getSession(sessionId).then((res) => {
      if (res.ok) {
        const d = res.data as { session?: typeof session };
        setSession(d.session ?? null);
      }
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell>
        <ScreenState variant="error" message="Session not found" />
      </PageShell>
    );
  }

  const pool = distributePrizePool(
    session.total_pool_cents || session.entry_fee_cents * Math.max(session.registered_count, 1)
  );
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow={session.status.toUpperCase()}
        title={session.title}
        subtitle={`Entry ${fmt(session.entry_fee_cents)} · ${session.registered_count} registered`}
      >
        <CountdownHero targetDate={session.starts_at} className="my-5" />
        <PrimaryCTA href={`/sessions/prepare?sessionId=${sessionId}`}>
          Prepare for Battle
        </PrimaryCTA>
      </HeroFocus>

      <section className="space-y-2">
        <SectionLabel>Prize pool split</SectionLabel>
        <ul className="space-y-2 rounded-xl border border-legacy-divider bg-legacy-card p-4 text-sm">
          <li className="flex justify-between text-white"><span>Winning squad 50%</span><span className="text-legacy-gold">{fmt(pool.winningSquad)}</span></li>
          <li className="flex justify-between text-legacy-muted"><span>Runner-ups 20%</span><span>{fmt(pool.runnerUpSquads)}</span></li>
          <li className="flex justify-between text-legacy-muted"><span>Platform 20%</span><span>{fmt(pool.platform)}</span></li>
          <li className="flex justify-between text-legacy-muted"><span>Camp pool 5%</span><span>{fmt(pool.campRewardPool)}</span></li>
          <li className="flex justify-between text-legacy-muted"><span>Legacy War 5%</span><span>{fmt(pool.legacyWarReserve)}</span></li>
        </ul>
      </section>

      <button
        type="button"
        className="w-full text-sm text-legacy-muted"
        onClick={() => router.push("/sessions")}
      >
        ← Sessions
      </button>
    </PageShell>
  );
}
