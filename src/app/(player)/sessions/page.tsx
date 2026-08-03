"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot } from "lucide-react";
import {
  CountdownHero,
  HeroFocus,
  PageShell,
  PrimaryCTA,
  SectionLabel,
  ListRow,
} from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { ScreenState } from "@/components/ui/ScreenState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CreatePracticeModal } from "@/components/session/CreatePracticeModal";
import { sessionNetwork } from "@/lib/network";
import { distributePrizePool, OFFICIAL_SESSIONS_PER_DAY } from "@/lib/economy/session-pool";

interface Session {
  id: string;
  title: string;
  status: "open" | "locked" | "active" | "completed";
  starts_at: string;
  entry_fee_cents: number;
  registered_count: number;
  total_pool_cents: number;
  max_players?: number;
  is_featured?: boolean;
  session_type?: string;
  economy_config?: { ai_bot_count?: number };
  phase_config?: unknown[];
  is_user_registered?: boolean;
}

function formatFee(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState<Session | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await sessionNetwork.listSessions();
    if (!result.ok) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    const d = result.data as { sessions?: Session[]; practiceSessions?: Session[] };
    setSessions(d.sessions ?? []);
    setPracticeSessions(d.practiceSessions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const official = sessions.filter(
    (s) => s.status === "open" || s.status === "locked" || s.status === "active"
  );
  const featured = official.find((s) => s.is_featured) ?? official[0] ?? null;
  const activePractice = practiceSessions.filter(
    (s) => s.status === "open" || s.status === "locked" || s.status === "active"
  );

  const poolPreview = joinTarget
    ? distributePrizePool(joinTarget.total_pool_cents || joinTarget.entry_fee_cents * Math.max(joinTarget.registered_count, 1))
    : null;

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <ScreenState variant="error" message={error} action={<PrimaryCTA onClick={() => void loadSessions()}>Retry</PrimaryCTA>} />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PlayerPageHeader />

      <HeroFocus
        eyebrow={`${OFFICIAL_SESSIONS_PER_DAY} official / day · every 4 hours`}
        title={featured?.title ?? "No session open"}
        subtitle={
          featured
            ? `${formatFee(featured.entry_fee_cents)} entry · ${featured.registered_count} registered`
            : "Check back for the next official arena."
        }
      >
        {featured && (
          <>
            <CountdownHero targetDate={featured.starts_at} className="my-5" />
            <PrimaryCTA onClick={() => setJoinTarget(featured)}>Join session</PrimaryCTA>
          </>
        )}
      </HeroFocus>

      <section className="space-y-2">
        <SectionLabel>Official sessions</SectionLabel>
        {official.length === 0 ? (
          <ScreenState variant="empty" title="No official sessions" message="Arenas open on a 4-hour cadence." />
        ) : (
          official.map((s) => (
            <ListRow
              key={s.id}
              title={s.title}
              subtitle={`${s.status.toUpperCase()} · ${formatFee(s.entry_fee_cents)} · ${s.registered_count} in`}
              onClick={() => setJoinTarget(s)}
              trailing={<Badge variant="purple">{s.status}</Badge>}
            />
          ))
        )}
      </section>

      {/* AI Practice — preserved per plan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>AI Practice</SectionLabel>
          <Button variant="ghost" className="text-xs" onClick={() => setShowPracticeModal(true)}>
            Create
          </Button>
        </div>
        <p className="text-xs text-legacy-muted">
          Private session against bots. Free entry. Prepare loadout required.
        </p>
        {activePractice.length === 0 ? (
          <Card className="border-legacy-gold/20">
            <div className="flex items-center gap-2 text-legacy-gold">
              <Bot className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">AI Practice</span>
            </div>
            <p className="mt-2 text-sm text-legacy-muted">No active practice. Create one to train.</p>
            <Button className="mt-3 w-full" onClick={() => setShowPracticeModal(true)}>
              Create AI Practice
            </Button>
          </Card>
        ) : (
          activePractice.map((session) => {
            const botCount = session.economy_config?.ai_bot_count ?? 0;
            const phaseCount = Array.isArray(session.phase_config) ? session.phase_config.length : 0;
            return (
              <Card key={session.id} className="border-legacy-gold/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-legacy-gold">
                      <Bot className="h-4 w-4" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">AI Practice</span>
                    </div>
                    <h3 className="mt-1 font-display font-bold text-white">{session.title}</h3>
                    <p className="mt-1 text-xs text-legacy-muted">
                      {botCount} bots · {phaseCount} phases · {session.status}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(
                        session.status === "active"
                          ? `/play/${session.id}`
                          : `/sessions/prepare?sessionId=${session.id}&type=ai_practice`
                      )
                    }
                  >
                    {session.status === "active" ? "Continue" : "Enter"}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </section>

      <Link href="/sessions/prepare" className="block text-center text-sm text-legacy-blue hover:underline">
        Prepare loadout →
      </Link>

      <CreatePracticeModal
        open={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        onCreated={(playUrl) => {
          if (playUrl) router.push(playUrl);
          else void loadSessions();
        }}
      />

      <BottomSheet
        open={!!joinTarget}
        onOpenChange={(open) => !open && setJoinTarget(null)}
        title="Join session"
      >
        {joinTarget && (
          <div className="space-y-4">
            <p className="text-sm text-white font-semibold">{joinTarget.title}</p>
            <p className="text-sm text-legacy-muted">
              Entry {formatFee(joinTarget.entry_fee_cents)} · Pool {formatFee(joinTarget.total_pool_cents)}
            </p>
            {poolPreview && (
              <ul className="space-y-1 text-xs text-legacy-muted">
                <li>Winning squad 50% — {formatFee(poolPreview.winningSquad)}</li>
                <li>Runner-ups 20% — {formatFee(poolPreview.runnerUpSquads)}</li>
                <li>Platform 20% — {formatFee(poolPreview.platform)}</li>
                <li>Camp pool 5% — {formatFee(poolPreview.campRewardPool)}</li>
                <li>Legacy War 5% — {formatFee(poolPreview.legacyWarReserve)}</li>
              </ul>
            )}
            <PrimaryCTA
              href={`/sessions/prepare?sessionId=${joinTarget.id}`}
              onClick={() => setJoinTarget(null)}
            >
              Prepare for Battle
            </PrimaryCTA>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                router.push(`/sessions/${joinTarget.id}`);
                setJoinTarget(null);
              }}
            >
              View details
            </Button>
          </div>
        )}
      </BottomSheet>
    </PageShell>
  );
}
