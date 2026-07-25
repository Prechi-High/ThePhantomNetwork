"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PhaseEntry, EliminationRuleType } from "@/types/gameplay";

interface PhaseConfigEditorProps {
  phases: PhaseEntry[];
  onChange: (phases: PhaseEntry[]) => void;
}

export function PhaseConfigEditor({ phases, onChange }: PhaseConfigEditorProps) {
  const addPhase = () => {
    onChange([
      ...phases,
      {
        phase: phases.length + 1,
        duration_minutes: 5,
        elimination_rule: "none",
        config: {},
      },
    ]);
  };

  const removePhase = (index: number) => {
    if (phases.length <= 1) return;
    onChange(
      phases.filter((_, i) => i !== index).map((p, i) => ({ ...p, phase: i + 1 }))
    );
  };

  const updatePhase = (index: number, updates: Partial<PhaseEntry>) => {
    const next = [...phases];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Phase Configuration</h2>
        <Button size="sm" type="button" onClick={addPhase}>
          + Add Phase
        </Button>
      </div>
      {phases.map((phase, index) => (
        <div key={index} className="border border-phantom-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Phase {phase.phase}</h3>
            {phases.length > 1 && (
              <Button size="sm" variant="danger" type="button" onClick={() => removePhase(index)}>
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-phantom-muted">Duration (minutes)</label>
              <input
                type="number"
                value={phase.duration_minutes}
                onChange={(e) =>
                  updatePhase(index, { duration_minutes: parseInt(e.target.value, 10) || 1 })
                }
                className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-phantom-muted">Elimination Rule</label>
              <select
                value={phase.elimination_rule}
                onChange={(e) => {
                  const rule = e.target.value as EliminationRuleType;
                  updatePhase(index, {
                    elimination_rule: rule,
                    config:
                      rule === "target"
                        ? {
                            target: 38,
                            revivable_min: 35,
                            revivable_max: 37.5,
                            eliminated_below: 35,
                          }
                        : rule === "percentage"
                          ? { eliminate_bottom_pct: 50 }
                          : {},
                  });
                }}
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
                  value={(phase.config as { target: number }).target}
                  onChange={(e) =>
                    updatePhase(index, {
                      config: {
                        ...(phase.config as {
                          target: number;
                          revivable_min: number;
                          revivable_max: number;
                          eliminated_below: number;
                        }),
                        target: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-phantom-muted">Revivable Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={(phase.config as { revivable_min: number }).revivable_min}
                  onChange={(e) =>
                    updatePhase(index, {
                      config: {
                        ...(phase.config as {
                          target: number;
                          revivable_min: number;
                          revivable_max: number;
                          eliminated_below: number;
                        }),
                        revivable_min: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-phantom-muted">Revivable Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={(phase.config as { revivable_max: number }).revivable_max}
                  onChange={(e) =>
                    updatePhase(index, {
                      config: {
                        ...(phase.config as {
                          target: number;
                          revivable_min: number;
                          revivable_max: number;
                          eliminated_below: number;
                        }),
                        revivable_max: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-phantom-muted">Eliminated Below</label>
                <input
                  type="number"
                  value={(phase.config as { eliminated_below: number }).eliminated_below}
                  onChange={(e) =>
                    updatePhase(index, {
                      config: {
                        ...(phase.config as {
                          target: number;
                          revivable_min: number;
                          revivable_max: number;
                          eliminated_below: number;
                        }),
                        eliminated_below: parseInt(e.target.value, 10),
                      },
                    })
                  }
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
                value={(phase.config as { eliminate_bottom_pct: number }).eliminate_bottom_pct}
                onChange={(e) =>
                  updatePhase(index, {
                    config: {
                      ...(phase.config as { eliminate_bottom_pct: number }),
                      eliminate_bottom_pct: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
              />
            </div>
          )}
        </div>
      ))}
    </Card>
  );
}
