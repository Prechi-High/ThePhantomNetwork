"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CountdownHero,
  HeroFocus,
  LiveTicker,
  PageShell,
  PrimaryCTA,
  SectionLabel,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { MESSAGES } from "@/lib/brand/terminology";
import { sessionNetwork, worldNetwork, authNetwork } from "@/lib/network";

interface SessionRow {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  is_featured?: boolean;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [nextSession, setNextSession] = useState<SessionRow | null>(null);
  const [ticker, setTicker] = useState<string[]>([]);
  const [username, setUsername] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      sessionNetwork.listSessions(),
      worldNetwork.getLiveFeed(),
      authNetwork.getProfile(),
    ]).then(([sessRes, feedRes, profileRes]) => {
      if (sessRes.ok) {
        const sessions = ((sessRes.data as { sessions?: SessionRow[] }).sessions ?? []).filter(
          (s) => s.status === "open" || s.status === "locked" || s.status === "active"
        );
        const featured = sessions.find((s) => s.is_featured) ?? sessions[0] ?? null;
        setNextSession(featured);
      }
      if (feedRes.ok) {
        const events = (feedRes.data as { events?: Array<{ message?: string; type?: string }> }).events ?? [];
        setTicker(
          events.slice(0, 3).map((e) => e.message ?? e.type ?? "World activity")
        );
      }
      if (profileRes.ok) {
        const p = (profileRes.data as { profile?: { username?: string; avatar_url?: string } }).profile;
        setUsername(p?.username ?? "Player");
        setAvatarUrl(p?.avatar_url ?? null);
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
      <PlayerPageHeader username={username} avatarUrl={avatarUrl} />

      <HeroFocus
        eyebrow="Next official session"
        title={nextSession?.title ?? "No session open"}
        subtitle="One battle. Survive. Forge your Legacy."
      >
        <CountdownHero
          targetDate={nextSession?.starts_at ?? null}
          className="my-6"
        />
        {nextSession ? (
          <PrimaryCTA href={`/sessions/${nextSession.id}`}>
            {MESSAGES.enterBattle}
          </PrimaryCTA>
        ) : (
          <PrimaryCTA href="/sessions">View sessions</PrimaryCTA>
        )}
      </HeroFocus>

      <LiveTicker
        items={
          ticker.length
            ? ticker
            : ["Players entering the arena", "Official sessions every 4 hours", "Legacy War reserve growing"]
        }
      />

      <section className="space-y-2">
        <SectionLabel>Your faction</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/squads"
            className="rounded-xl border border-legacy-divider bg-legacy-card px-4 py-3 text-center text-sm font-medium text-white hover:border-legacy-gold/40"
          >
            Squad
          </Link>
          <Link
            href="/camps"
            className="rounded-xl border border-legacy-divider bg-legacy-card px-4 py-3 text-center text-sm font-medium text-white hover:border-legacy-gold/40"
          >
            Camp
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
