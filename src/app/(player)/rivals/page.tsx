"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RivalsPage() {
  const [rivalries, setRivalries] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch("/api/rivals")
      .then((r) => r.json())
      .then((d) => setRivalries(d.rivalries ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Rivals</h1>
      {rivalries.length === 0 ? (
        <Card><p className="text-phantom-muted">No rivalries yet. Steal to create them.</p></Card>
      ) : (
        rivalries.map((r) => (
          <Card key={r.id as string} className="flex justify-between">
            <span>Rivalry</span>
            <Badge variant="danger">Intensity: {r.intensity as number}</Badge>
          </Card>
        ))
      )}
    </div>
  );
}
