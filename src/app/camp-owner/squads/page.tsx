"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface Squad {
  id: string;
  name: string;
  member_count: number;
  squad_tokens: number;
  history_sessions: number;
}

export default function CampSquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);

  useEffect(() => {
    fetch("/api/camp-owner/squads")
      .then((r) => r.json())
      .then((d) => setSquads(d.squads ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Squad Activity</h1>
      <div className="space-y-2">
        {squads.map((s) => (
          <Card key={s.id}>
            <p className="font-medium">{s.name}</p>
            <p className="text-sm text-phantom-muted">
              {s.member_count} members · {s.squad_tokens} tokens · {s.history_sessions} sessions
            </p>
          </Card>
        ))}
        {!squads.length && (
          <Card>
            <p className="text-phantom-muted">No squads with camp members yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
