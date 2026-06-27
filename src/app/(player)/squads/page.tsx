"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SquadsPage() {
  const [squads, setSquads] = useState<Record<string, unknown>[]>([]);
  const [mySquad, setMySquad] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadSquads = () => {
    fetch("/api/squads/leaderboard")
      .then((r) => r.json())
      .then((d) => setSquads(d.squads ?? []));
    fetch("/api/squads/me")
      .then((r) => r.json())
      .then((d) => setMySquad(d.squad ?? null));
  };

  useEffect(() => {
    loadSquads();
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/squads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setShowCreate(false);
      setName("");
      loadSquads();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Squads</h1>
        {!mySquad && (
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            Create
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Squad name"
            className="w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
          <Button onClick={handleCreate} className="w-full">
            Create Squad
          </Button>
        </Card>
      )}

      {mySquad && (
        <Card glow>
          <p className="font-medium">Your Squad: {mySquad.name as string}</p>
          <p className="text-sm text-phantom-gold">
            {mySquad.squad_tokens as number} squad tokens
          </p>
          <Link href={`/squads/${mySquad.id}`}>
            <Button variant="secondary" size="sm" className="mt-2">
              View
            </Button>
          </Link>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-sm text-phantom-muted">Leaderboard</h2>
        {squads.map((squad, i) => (
          <Link key={squad.id as string} href={`/squads/${squad.id}`}>
            <Card className="mb-2 flex justify-between hover:border-phantom-gold/50">
              <span>
                #{i + 1} {squad.name as string}
              </span>
              <span className="text-phantom-gold">
                {squad.squad_tokens as number} tokens
              </span>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
