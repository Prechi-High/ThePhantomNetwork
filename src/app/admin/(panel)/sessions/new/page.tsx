"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NewSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Phantom Session");
  const [startsAt, setStartsAt] = useState("");
  const [entryFee, setEntryFee] = useState("5");
  const [maxPlayers, setMaxPlayers] = useState("100");
  const [platformFee, setPlatformFee] = useState("15");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!startsAt) {
      setError("Start time is required");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/sessions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title,
        starts_at: new Date(startsAt).toISOString(),
        entry_fee_cents: Math.round(parseFloat(entryFee) * 100),
        max_players: parseInt(maxPlayers, 10),
        platform_fee_pct: parseFloat(platformFee),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/admin/sessions");
      return;
    }
    setError(data.error ?? "Failed to create session");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-bold">Create Session</h1>
      <Card className="space-y-4">
        <div>
          <label className="text-sm text-phantom-muted">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-phantom-muted">Starts at</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-phantom-muted">Entry fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-phantom-muted">Max players</label>
            <input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-phantom-muted">Platform fee (%)</label>
          <input
            type="number"
            step="0.1"
            value={platformFee}
            onChange={(e) => setPlatformFee(e.target.value)}
            className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-phantom-danger">{error}</p>}
        <Button onClick={handleCreate} disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Session"}
        </Button>
      </Card>
    </div>
  );
}
