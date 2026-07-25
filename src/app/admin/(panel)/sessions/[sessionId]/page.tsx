"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PhaseConfigEditor } from "@/components/session/PhaseConfigEditor";
import type { PhaseEntry } from "@/types/gameplay";

export default function EditSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [entryFee, setEntryFee] = useState("5");
  const [maxPlayers, setMaxPlayers] = useState("100");
  const [platformFee, setPlatformFee] = useState("15");
  const [phases, setPhases] = useState<PhaseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session) {
          setTitle(d.session.title);
          setStartsAt(new Date(d.session.starts_at).toISOString().slice(0, 16));
          setEntryFee(String(d.session.entry_fee_cents / 100));
          setMaxPlayers(String(d.session.max_players));
          setPlatformFee(String(d.session.platform_fee_pct));
          setPhases(d.session.phase_config || []);
        }
      });
  }, [sessionId]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        starts_at: new Date(startsAt).toISOString(),
        entry_fee_cents: Math.round(parseFloat(entryFee) * 100),
        max_players: parseInt(maxPlayers, 10),
        platform_fee_pct: parseFloat(platformFee),
        phase_config: phases,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push("/admin/sessions");
      return;
    }
    setError(data.error ?? "Update failed");
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this session?")) return;
    await fetch(`/api/admin/sessions/${sessionId}`, { method: "DELETE" });
    router.push("/admin/sessions");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Edit Session</h1>
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
      </Card>

      <PhaseConfigEditor phases={phases} onChange={setPhases} />

      {error && <p className="text-sm text-phantom-danger">{error}</p>}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
      <Button onClick={handleCancel} variant="danger" className="w-full">
        Cancel Session
      </Button>
    </div>
  );
}
