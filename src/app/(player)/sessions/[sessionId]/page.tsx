"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then(setSession);
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    const res = await fetch(`/api/sessions/${id}/join`, { method: "POST" });
    if (res.ok) {
      router.refresh();
      fetch(`/api/sessions/${id}`).then((r) => r.json()).then(setSession);
    }
    setJoining(false);
  };

  if (!session?.session) return <p className="text-phantom-muted">Loading...</p>;

  const s = session.session as {
    title: string;
    status: string;
    starts_at: string;
    entry_fee_cents: number;
    registration_closes_at: string;
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{s.title}</h1>
      <Card glow>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-phantom-muted">Status</span>
            <Badge>{s.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Starts</span>
            <span>{new Date(s.starts_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Registration closes</span>
            <span>{new Date(s.registration_closes_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Entry Fee</span>
            <span className="text-phantom-gold">${(s.entry_fee_cents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Pool</span>
            <span className="font-mono text-lg text-phantom-gold">
              ${((session.poolCents as number) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {s.status === "open" && (
        <div className="space-y-2">
          <Button onClick={handleJoin} disabled={joining} className="w-full">
            {joining ? "Joining..." : "Join Session"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push(`/shop?sessionId=${id}`)}
          >
            Visit Shop First
          </Button>
        </div>
      )}
    </div>
  );
}
