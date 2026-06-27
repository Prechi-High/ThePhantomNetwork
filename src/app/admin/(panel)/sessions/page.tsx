"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Session {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  registered_count: number;
  entry_fee_cents: number;
  total_pool_cents: number;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (sessionId: string, action: "lock" | "start") => {
    setLoading(sessionId + action);
    await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action }),
    });
    setLoading(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Sessions</h1>
        <Link href="/admin/sessions/new">
          <Button size="sm">+ New Session</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-phantom-muted">
                  {new Date(s.starts_at).toLocaleString()} · {s.registered_count} players · pool{" "}
                  ${(s.total_pool_cents / 100).toFixed(2)}
                </p>
              </div>
              <Badge>{s.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.status === "open" && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!!loading}
                  onClick={() => runAction(s.id, "lock")}
                >
                  Lock & Matchmake
                </Button>
              )}
              {s.status === "locked" && (
                <Button
                  size="sm"
                  disabled={!!loading}
                  onClick={() => runAction(s.id, "start")}
                >
                  Start Session
                </Button>
              )}
              {["draft", "open"].includes(s.status) && (
                <Link href={`/admin/sessions/${s.id}`}>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
        {!sessions.length && (
          <Card>
            <p className="text-phantom-muted">No sessions yet. Create one to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
