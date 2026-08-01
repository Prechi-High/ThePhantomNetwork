"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AppErrorRow, ErrorSeverity } from "@/lib/monitoring/types";
import { cn } from "@/lib/utils";
import { adminNetwork } from "@/lib/network";

const severityVariant: Record<ErrorSeverity, "gold" | "danger" | "muted"> = {
  critical: "danger",
  high: "danger",
  medium: "gold",
  low: "muted",
};

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<AppErrorRow[]>([]);
  const [stats, setStats] = useState({ total: 0, unresolvedCritical: 0 });
  const [filter, setFilter] = useState<ErrorSeverity | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    const params = filter === "all" ? undefined : `severity=${filter}`;
    const result = await adminNetwork.getErrors(params);
    if (result.ok) {
      const d = result.data as {
        errors?: AppErrorRow[];
        stats?: { total: number; unresolvedCritical: number };
      };
      setErrors(d.errors ?? []);
      setStats(d.stats ?? { total: 0, unresolvedCritical: 0 });
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15000);
    return () => clearInterval(id);
  }, [filter]);

  const copyError = async (err: AppErrorRow) => {
    const payload = JSON.stringify(err, null, 2);
    await navigator.clipboard.writeText(payload);
    setCopiedId(err.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAll = () => {
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phantom-errors-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolveError = async (id: string) => {
    await adminNetwork.deleteErrors({ id });
    void load();
  };

  const clearAll = async () => {
    if (!confirm("Clear all error logs?")) return;
    await adminNetwork.deleteErrors({ clearAll: true });
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Error Monitor</h1>
          <p className="text-sm text-phantom-muted">
            {stats.total} total · {stats.unresolvedCritical} unresolved critical
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={downloadAll}>
            Download JSON
          </Button>
          <Button size="sm" variant="danger" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1 text-sm capitalize",
              filter === s ? "bg-phantom-gold/20 text-phantom-gold" : "text-phantom-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {errors.map((err) => (
          <Card key={err.id} className={cn(err.resolved && "opacity-60")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={severityVariant[err.severity]}>{err.severity}</Badge>
                  <Badge variant="muted">{err.area}</Badge>
                  {err.resolved && <Badge variant="muted">resolved</Badge>}
                </div>
                <p className="font-medium">{err.message}</p>
                {err.cause && (
                  <p className="text-xs text-phantom-muted">
                    <span className="text-phantom-danger">Cause:</span> {err.cause}
                  </p>
                )}
                {err.url && <p className="text-xs text-phantom-muted break-all">{err.url}</p>}
                <p className="text-xs text-phantom-muted">
                  {new Date(err.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => copyError(err)}>
                  {copiedId === err.id ? "Copied!" : "Copy"}
                </Button>
                {!err.resolved && (
                  <Button size="sm" variant="secondary" onClick={() => resolveError(err.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
            {err.stack && (
              <pre className="mt-3 max-h-32 overflow-auto rounded bg-phantom-bg p-2 text-xs text-phantom-muted">
                {err.stack}
              </pre>
            )}
            {Object.keys(err.context ?? {}).length > 0 && (
              <pre className="mt-2 max-h-24 overflow-auto rounded bg-phantom-bg p-2 text-xs text-phantom-muted">
                {JSON.stringify(err.context, null, 2)}
              </pre>
            )}
          </Card>
        ))}
        {!errors.length && (
          <Card>
            <p className="text-phantom-muted">No errors logged yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
