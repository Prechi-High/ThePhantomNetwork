"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SocialPage() {
  const [playedWith, setPlayedWith] = useState<{ userId: string; username: string; sessions: number }[]>([]);

  useEffect(() => {
    fetch("/api/social/played-with")
      .then((r) => r.json())
      .then((d) => setPlayedWith(d.playedWith ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Social</h1>
      <section>
        <h2 className="mb-3 text-sm text-phantom-muted">Played With</h2>
        {playedWith.length === 0 ? (
          <Card><p className="text-phantom-muted">Complete a session to discover teammates.</p></Card>
        ) : (
          playedWith.map((p) => (
            <Card key={p.userId} className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.username}</p>
                <p className="text-xs text-phantom-muted">{p.sessions} sessions together</p>
              </div>
              <Button size="sm" variant="secondary">
                Invite to Squad
              </Button>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
