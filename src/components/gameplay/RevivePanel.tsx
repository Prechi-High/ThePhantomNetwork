"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { REVIVE_COST } from "@/types/gameplay";

interface RevivePanelProps {
  targetUsername: string;
  required: number;
  contributed: number;
  onContribute: (amount: number) => void;
}

export function RevivePanel({
  targetUsername,
  required,
  contributed,
  onContribute,
}: RevivePanelProps) {
  const remaining = required - contributed;

  return (
    <Card className="border-phantom-gold/30 space-y-4">
      <h3 className="font-display text-lg text-phantom-gold">
        Revive {targetUsername}
      </h3>
      <div className="flex justify-between text-sm">
        <span>Required: {required}</span>
        <span>Contributed: {contributed}</span>
        <span>Remaining: {remaining}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((amount) => (
          <Button
            key={amount}
            variant="secondary"
            size="sm"
            onClick={() => onContribute(amount)}
            disabled={remaining <= 0}
            className="flex-1"
          >
            Give {amount}
          </Button>
        ))}
      </div>
    </Card>
  );
}
