"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CampDetailPage() {
  const { campId } = useParams<{ campId: string }>();
  const [camp, setCamp] = useState<Record<string, unknown> | null>(null);
  const [leaderboard, setLeaderboard] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch(`/api/camps/${campId}`)
      .then((r) => r.json())
      .then((d) => setCamp(d.camp));
    fetch(`/api/camps/${campId}/leaderboard`)
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard ?? []));
  }, [campId]);

  const handleSwitch = async () => {
    await fetch("/api/camps/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campId }),
    });
  };

  if (!camp) return <p className="text-phantom-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{camp.name as string}</h1>
      <Card>
        <p>{camp.member_count as number} members</p>
        <p className="text-phantom-gold">{camp.leaderboard_score as number} score</p>
        {!camp.is_default && (
          <Button onClick={handleSwitch} variant="secondary" className="mt-3 w-full">
            Switch to this Camp
          </Button>
        )}
      </Card>
      <section>
        <h2 className="mb-3 font-semibold">Leaderboard</h2>
        {leaderboard.map((p, i) => (
          <Card key={p.id as string} className="mb-2 flex justify-between">
            <span>#{i + 1} {p.username as string}</span>
            <span className="text-phantom-gold">Lv.{p.level as number}</span>
          </Card>
        ))}
      </section>
    </div>
  );
}
