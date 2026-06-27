"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";

export default function SquadDetailPage() {
  const { squadId } = useParams<{ squadId: string }>();
  const [data, setData] = useState<{ squad: Record<string, unknown>; members: Record<string, unknown>[] } | null>(null);

  useEffect(() => {
    fetch(`/api/squads/${squadId}`)
      .then((r) => r.json())
      .then(setData);
  }, [squadId]);

  if (!data) return <p className="text-phantom-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{data.squad.name as string}</h1>
      <Card glow>
        <p>{data.squad.member_count as number} members</p>
        <p className="text-phantom-gold">{data.squad.squad_tokens as number} squad tokens</p>
        <p className="text-sm text-phantom-muted">
          {data.squad.history_sessions as number} sessions completed
        </p>
      </Card>
      <section>
        <h2 className="mb-3 font-semibold">Members</h2>
        {data.members.map((m) => {
          const profile = m.profiles as { username: string; level: number };
          return (
            <Card key={m.id as string} className="mb-2 flex justify-between">
              <span>{profile?.username}</span>
              <span className="text-xs text-phantom-muted">{m.role as string}</span>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
