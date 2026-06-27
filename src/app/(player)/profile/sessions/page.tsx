"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export default function ProfileSessionsPage() {
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch("/api/profile/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Session History</h1>
      {sessions.length === 0 ? (
        <Card><p className="text-phantom-muted">No sessions yet.</p></Card>
      ) : (
        sessions.map((s) => (
          <Card key={s.id as string}>
            <p>Rank #{s.final_rank as number}</p>
            <p className="text-sm text-phantom-muted">
              {s.final_tokens as number} tokens
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
