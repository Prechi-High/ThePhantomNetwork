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

export default function SessionLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<{
    title: string;
    registered_count: number;
    max_players: number;
    total_pool_cents: number;
    starts_at: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      sessionNetwork.getSession(sessionId).then((res) => {
        if (res.ok) {
          const d = res.data as { session?: typeof session };
          if (d.session) setSession(d.session);
        }
        setLoading(false);
      });
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (!session?.starts_at || session.status !== "active") return;
    const diff = new Date(session.starts_at).getTime() - Date.now();
    if (diff <= 0 || session.status === "active") {
      // When live, offer enter
    }
  }, [session]);

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

  const canEnter = session.status === "active" || session.status === "locked";

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow="War briefing"
        title={session.title}
        subtitle={`${session.registered_count}/${session.max_players || "—"} warriors · Pool $${(session.total_pool_cents / 100).toFixed(2)}`}
      >
        <CountdownHero targetDate={session.starts_at} className="my-5" />
        {canEnter ? (
          <PrimaryCTA href={`/play/${sessionId}`}>Enter arena</PrimaryCTA>
        ) : (
          <p className="text-sm text-legacy-muted">Waiting for lock… stay ready.</p>
        )}
      </HeroFocus>

      <section className="space-y-2">
        <SectionLabel>Squad roster</SectionLabel>
        <div className="rounded-xl border border-legacy-divider bg-legacy-card px-4 py-6 text-center text-sm text-legacy-muted">
          Your squad gathers here. Status: {session.status.toUpperCase()}
        </div>
      </section>

      <button
        type="button"
        className="w-full text-sm text-legacy-muted hover:text-white"
        onClick={() => router.push("/sessions")}
      >
        ← Back to sessions
      </button>
    </PageShell>
  );
}
