"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SessionCountdown } from "@/components/session/SessionCountdown";
import { useSessionPoll } from "@/hooks/useSessionPoll";

interface Session {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  registration_closes_at?: string;
  entry_fee_cents: number;
  registered_count: number;
  total_pool_cents: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/sessions");
    const d = await res.json();
    setSessions(d.sessions ?? []);
  }, []);

  useSessionPoll(loadSessions, 8000);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Sessions</h1>
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{session.title}</p>
                <p className="text-xs text-phantom-muted">
                  {new Date(session.starts_at).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-phantom-gold">
                  Pool: ${(session.total_pool_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Badge>{session.status}</Badge>
                <SessionCountdown
                  startsAt={session.starts_at}
                  status={session.status}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={`/sessions/${session.id}`} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Details
                </Button>
              </Link>
              {session.status === "active" && (
                <Link href={`/play/${session.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    Play
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
        {sessions.length === 0 && (
          <Card>
            <p className="text-phantom-muted">No active sessions.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
