"use client";

import { useEffect, useState } from "react";
import { ListRow, PageShell, HeroFocus } from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { authNetwork } from "@/lib/network";

export default function ProfileSessionsPage() {
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authNetwork.getProfileSessions().then((res) => {
      if (res.ok) {
        const d = res.data as { sessions?: Record<string, unknown>[] };
        setSessions(d.sessions ?? []);
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
      <HeroFocus eyebrow="History" title="Session History" subtitle="Past arenas and ranks." />
      {sessions.length === 0 ? (
        <ScreenState variant="empty" title="No sessions yet" message="Enter an official session to begin." />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <ListRow
              key={String(s.id ?? s.session_id)}
              title={`Rank #${s.final_rank ?? "—"}`}
              subtitle={`${s.final_tokens ?? 0} tokens`}
              href={s.session_id ? `/sessions/${s.session_id}/results` : undefined}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
