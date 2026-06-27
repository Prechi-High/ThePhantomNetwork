"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { StealTarget } from "@/types/gameplay";

interface StealTargetPickerProps {
  targets: StealTarget[];
  onSelect: (target: StealTarget) => void;
  onCancel: () => void;
}

export function StealTargetPicker({
  targets,
  onSelect,
  onCancel,
}: StealTargetPickerProps) {
  return (
    <Card glow className="space-y-4">
      <h3 className="font-display text-lg font-bold text-phantom-danger">
        Choose Your Target
      </h3>
      <div className="space-y-2">
        {targets.map((target) => (
          <button
            key={target.userId}
            onClick={() => onSelect(target)}
            className="flex w-full items-center justify-between rounded-lg border border-phantom-border p-3 text-left transition-colors hover:border-phantom-danger hover:bg-phantom-danger/10"
          >
            <div>
              <p className="font-medium">{target.username}</p>
              <p className="text-xs text-phantom-muted">{target.reason}</p>
            </div>
            <span className="font-mono text-phantom-gold">{target.tokens} tokens</span>
          </button>
        ))}
      </div>
      <Button variant="ghost" onClick={onCancel} className="w-full">
        Cancel
      </Button>
    </Card>
  );
}
