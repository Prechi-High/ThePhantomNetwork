"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import {
  HomeLiveSessionsRow,
  HomeMetricsRow,
  HomeNextSessionCard,
  HomeOpportunitiesCard,
  HomeProfileHeader,
  HomeSpinWidget,
  HomeSquadCard,
  HomeTopCampsStrip,
  HomeWorldActivityFeed,
} from "@/components/home";
import { authNetwork, economyNetwork, sessionNetwork, worldNetwork } from "@/lib/network";
import { apiFetch } from "@/lib/network/client";

interface SessionRow {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  is_featured?: boolean;
  entry_fee_cents?: number;
  registered_count?: number;
  max_players?: number;
  total_pool_cents?: number;
}

interface ProfileData {
  username?: string;
  avatar_url?: string;
  level?: number;
  prestige_score?: number;
  wallet_balance_cents?: number;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [nextSession, setNextSession] = useState<SessionRow | null>(null);
  const [ticker, setTicker] = useState<string[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ username: "Player" });
  const [squad, setSquad] = useState<{
    name: string;
    memberCount: number;
    rank?: number;
    influence?: number;
  } | null>(null);
  const [campMomentum, setCampMomentum] = useState<
    Array<{ campName: string; campSlug?: string; momentum: number }>
  >([]);

  useEffect(() => {
    Promise.all([
      sessionNetwork.listSessions(),
      worldNetwork.getLiveFeed(),
      authNetwork.getProfile(),
      economyNetwork.getWallet(),
      worldNetwork.getSummary(),
      apiFetch<{ squad?: { name?: string; rank?: number; influence_score?: number }; members?: unknown[] }>(
        "/api/squads/me"
      ),
    ]).then(([sessRes, feedRes, profileRes, walletRes, summaryRes, squadRes]) => {
      if (sessRes.ok) {
        const all = ((sessRes.data as { sessions?: SessionRow[] }).sessions ?? []).filter(
          (s) => s.status === "open" || s.status === "locked" || s.status === "active"
        );
        setSessions(all);
        setNextSession(all.find((s) => s.is_featured) ?? all[0] ?? null);
      }
      if (feedRes.ok) {
        const events = (feedRes.data as { events?: Array<{ message?: string; type?: string }> }).events ?? [];
        setTicker(events.slice(0, 5).map((e) => e.message ?? e.type ?? "World activity"));
      }
      if (profileRes.ok) {
        const p = (profileRes.data as { profile?: ProfileData }).profile ?? {};
        setProfile(p);
        if (walletRes.ok && walletRes.data.balance != null) {
          setProfile((prev) => ({
            ...prev,
            wallet_balance_cents: walletRes.data.balance,
          }));
        }
      }
      if (summaryRes.ok && summaryRes.data.campMomentum) {
        setCampMomentum(
          summaryRes.data.campMomentum.map((c) => ({
            campName: c.campName,
            campSlug: c.campName.toLowerCase(),
            momentum: c.momentum || c.weeklyTokens || 1,
          }))
        );
      }
      if (squadRes.ok && squadRes.data.squad) {
        const s = squadRes.data.squad;
        setSquad({
          name: s.name ?? "Your Squad",
          memberCount: (squadRes.data.members ?? []).length,
          rank: s.rank,
          influence: s.influence_score,
        });
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

  const level = profile.level ?? 1;
  const xp = (level * 1200) % 2000 || 1200;

  return (
    <PageShell className="space-y-5 pb-28">
      <HomeProfileHeader
        username={profile.username ?? "Player"}
        avatarUrl={profile.avatar_url}
        level={level}
        xp={xp}
        xpMax={2000}
      />

      <HomeMetricsRow
        tokens={4820}
        influence={profile.prestige_score ?? 0}
        earningsCents={profile.wallet_balance_cents ?? 0}
      />

      <HomeNextSessionCard session={nextSession} />

      <HomeLiveSessionsRow sessions={sessions} />

      <div className="grid grid-cols-2 gap-2">
        <HomeSpinWidget />
        <HomeSquadCard
          squad={
            squad
              ? {
                  ...squad,
                  growth: "+2.8%",
                  objective: "Capture Iron Pass",
                  objectivePct: 62,
                }
              : null
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <HomeOpportunitiesCard />
        <HomeWorldActivityFeed items={ticker} />
      </div>

      <HomeTopCampsStrip camps={campMomentum} />
    </PageShell>
  );
}
