"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PhaseEntry, EliminationRuleType } from "@/types/gameplay";

const defaultPhases: PhaseEntry[] = [
  { phase: 1, duration_minutes: 6, elimination_rule: "target", config: { target: 38, revivable_min: 35, revivable_max: 37.5, eliminated_below: 35 } },
  { phase: 2, duration_minutes: 6, elimination_rule: "percentage", config: { eliminate_bottom_pct: 60 } },
  { phase: 3, duration_minutes: 5, elimination_rule: "percentage", config: { eliminate_bottom_pct: 70 } },
  { phase: 4, duration_minutes: 3, elimination_rule: "none", config: {} },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Phantom Session");
  const [startsAt, setStartsAt] = useState("");
  const [entryFee, setEntryFee] = useState("5");
  const [maxPlayers, setMaxPlayers] = useState("100");
  const [platformFee, setPlatformFee] = useState("15");
  const [phases, setPhases] = useState<PhaseEntry[]>(defaultPhases);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPhase = () => {
    const newPhase: PhaseEntry = {
      phase: phases.length + 1,
      duration_minutes: 5,
      elimination_rule: "none",
      config: {},
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index: number) => {
    if (phases.length <= 1) return;
    const newPhases = phases.filter((_, i) => i !== index).map((p, i) => ({ ...p, phase: i + 1 }));
    setPhases(newPhases);
  };

  const updatePhase = (index: number, updates: Partial<PhaseEntry>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    setPhases(newPhases);
  };

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
        phase_config: phases,
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
    <div className="mx-auto max-w-4xl space-y-6">
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
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Phase Configuration</h2>
          <Button size="sm" onClick={addPhase}>+ Add Phase</Button>
        </div>
        {phases.map((phase, index) => (
          <div key={index} className="border border-phantom-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Phase {phase.phase}</h3>
              {phases.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => removePhase(index)}>Remove</Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-phantom-muted">Duration (minutes)</label>
                <input
                  type="number"
                  value={phase.duration_minutes}
                  onChange={(e) => updatePhase(index, { duration_minutes: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-phantom-muted">Elimination Rule</label>
                <select
                  value={phase.elimination_rule}
                  onChange={(e) => updatePhase(index, { elimination_rule: e.target.value as EliminationRuleType, config: e.target.value === "target" ? { target: 38, revivable_min: 35, revivable_max: 37.5, eliminated_below: 35 } : e.target.value === "percentage" ? { eliminate_bottom_pct: 50 } : {} })}
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                >
                  <option value="target">Target Based</option>
                  <option value="percentage">Percentage Based</option>
                  <option value="none">No Elimination</option>
                </select>
              </div>
            </div>
            {phase.elimination_rule === "target" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-phantom-muted">Target Tokens</label>
                  <input
                    type="number"
                    value={(phase.config as any).target}
                    onChange={(e) => updatePhase(index, { config: { ...(phase.config as any), target: parseInt(e.target.value) } })}
                    className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-phantom-muted">Revivable Min</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(phase.config as any).revivable_min}
                    onChange={(e) => updatePhase(index, { config: { ...(phase.config as any), revivable_min: parseFloat(e.target.value) } })}
                    className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-phantom-muted">Revivable Max</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(phase.config as any).revivable_max}
                    onChange={(e) => updatePhase(index, { config: { ...(phase.config as any), revivable_max: parseFloat(e.target.value) } })}
                    className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-phantom-muted">Eliminated Below</label>
                  <input
                    type="number"
                    value={(phase.config as any).eliminated_below}
                    onChange={(e) => updatePhase(index, { config: { ...(phase.config as any), eliminated_below: parseInt(e.target.value) } })}
                    className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                  />
                </div>
              </div>
            )}
            {phase.elimination_rule === "percentage" && (
              <div>
                <label className="text-sm text-phantom-muted">Eliminate Bottom (%)</label>
                <input
                  type="number"
                  value={(phase.config as any).eliminate_bottom_pct}
                  onChange={(e) => updatePhase(index, { config: { ...(phase.config as any), eliminate_bottom_pct: parseInt(e.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                />
              </div>
            )}
          </div>
        ))}
      </Card>

      {error && <p className="text-sm text-phantom-danger">{error}</p>}
      <Button onClick={handleCreate} disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Session"}
      </Button>
    </div>
  );
}
