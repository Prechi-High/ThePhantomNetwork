"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PhaseConfigEditor } from "@/components/session/PhaseConfigEditor";
import { DEFAULT_PHASES, PRACTICE_DEFAULT_TITLE } from "@/lib/session/default-phases";
import type { PhaseEntry } from "@/types/gameplay";
import { sessionNetwork } from "@/lib/network";

interface CreatePracticeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (playUrl: string) => void;
}

export function CreatePracticeModal({ open, onClose, onCreated }: CreatePracticeModalProps) {
  const [title, setTitle] = useState(PRACTICE_DEFAULT_TITLE);
  const [botCount, setBotCount] = useState(10);
  const [phases, setPhases] = useState<PhaseEntry[]>(DEFAULT_PHASES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sessionNetwork.createPractice({
        title,
        botCount,
        phase_config: phases,
      });
      if (!result.ok) {
        setError(result.error.message ?? "Failed to start practice");
        return;
      }
      const data = result.data as { playUrl?: string };
      onCreated(data.playUrl ?? "");
      onClose();
    } catch {
      setError("Failed to start practice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-phantom-bg-elevated border border-phantom-border p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="font-display text-xl font-bold">Create AI Practice</h2>
          <p className="text-sm text-phantom-muted mt-1">
            Private session — only you can see it. Free entry; Armory loadout required.
          </p>
        </div>

        <div>
          <label className="text-sm text-phantom-muted">Session title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-phantom-muted">Bot count ({botCount})</label>
          <input
            type="range"
            min={1}
            max={20}
            value={botCount}
            onChange={(e) => setBotCount(parseInt(e.target.value, 10))}
            className="mt-2 w-full"
          />
        </div>

        <PhaseConfigEditor phases={phases} onChange={setPhases} />

        {error && (
          <div className="text-sm text-phantom-danger space-y-2">
            <p>{error}</p>
            {error.toLowerCase().includes("loadout") && (
              <Link href="/armory" className="text-phantom-purple underline">
                Open Armory
              </Link>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Start Practice"}
          </Button>
        </div>
      </div>
    </div>
  );
}
