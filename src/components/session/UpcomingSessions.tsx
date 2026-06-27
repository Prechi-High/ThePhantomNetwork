"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SessionCountdown } from "@/components/session/SessionCountdown";
import { useSessionPoll } from "@/hooks/useSessionPoll";

interface Session {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  registration_closes_at?: string;
}

interface UpcomingSessionsProps {
  initialSessions: Session[];
}

export function UpcomingSessions({ initialSessions }: UpcomingSessionsProps) {
  const [sessions, setSessions] = useState(initialSessions);

  const load = useCallback(async () => {
    const res = await fetch("/api/sessions");
    const d = await res.json();
    const upcoming = (d.sessions ?? []).filter(
      (s: Session) => s.status === "open" || s.status === "locked"
    );
    setSessions(upcoming.slice(0, 3));
  }, []);

  useSessionPoll(load, 8000);

  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold">Upcoming Sessions</h2>
      <div className="space-y-3">
        {sessions.length ? (
          sessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`}>
              <Card className="transition-colors hover:border-phantom-gold/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-xs text-phantom-muted">
                      {new Date(session.starts_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge>{session.status}</Badge>
                    <SessionCountdown
                      startsAt={session.starts_at}
                      registrationClosesAt={session.registration_closes_at}
                      status={session.status}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <p className="text-phantom-muted">No sessions scheduled. Check back soon.</p>
          </Card>
        )}
      </div>
    </section>
  );
}
