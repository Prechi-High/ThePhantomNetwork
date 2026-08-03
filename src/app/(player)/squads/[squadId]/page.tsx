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
import { squadsNetwork } from "@/lib/network";

export default function SquadDetailPage() {
  const { squadId } = useParams<{ squadId: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    squad: Record<string, unknown>;
    members: Record<string, unknown>[];
  } | null>(null);

  useEffect(() => {
    squadsNetwork.getSquad(squadId).then((res) => {
      if (res.ok) setData(res.data as typeof data);
    }).finally(() => setLoading(false));
  }, [squadId]);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (!data?.squad) {
    return (
      <PageShell>
        <ScreenState variant="error" message="Squad not found" />
      </PageShell>
    );
  }

  const name = String(data.squad.name ?? "Squad");
  const members = data.members ?? [];

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow="Official emblem"
        title={name}
        subtitle={String(data.squad.motto ?? "No motto set")}
      >
        <div className="mt-4 flex justify-center">
          <EmblemAvatar alt={name} size="lg" emblem />
        </div>
      </HeroFocus>

      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Members" value={`${members.length}/15`} accent="blue" />
        <StatPill label="Tokens" value={Number(data.squad.squad_tokens ?? 0)} accent="gold" />
        <StatPill label="Wins" value={Number(data.squad.history_sessions ?? 0)} accent="emerald" />
      </div>

      <section className="space-y-2">
        <SectionLabel>Roster</SectionLabel>
        {members.length === 0 ? (
          <p className="text-sm text-legacy-muted">No members loaded.</p>
        ) : (
          members.map((m) => (
            <div
              key={String(m.user_id ?? m.id)}
              className="flex items-center justify-between rounded-xl border border-legacy-divider bg-legacy-card px-4 py-3 text-sm"
            >
              <span className="text-white">{String(m.username ?? "Member")}</span>
              <span className="text-[10px] uppercase text-legacy-muted">
                {String(m.role ?? "member")}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="rounded-xl border border-legacy-divider bg-legacy-surface p-4 text-xs text-legacy-muted">
        Treasury funds projects. Roles: Master, Deputy, Officer, Member. Chat is members-only.
      </section>
    </PageShell>
  );
}
