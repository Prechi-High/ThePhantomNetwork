"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CampsPage() {
  const [camps, setCamps] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch("/api/camps")
      .then((r) => r.json())
      .then((d) => setCamps(d.camps ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Camps</h1>
      <div className="space-y-3">
        {camps.map((camp) => (
          <Link key={camp.id as string} href={`/camps/${camp.id}`}>
            <Card className="hover:border-phantom-gold/50">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{camp.name as string}</p>
                  <p className="text-xs text-phantom-muted">
                    {camp.member_count as number} members
                  </p>
                </div>
                <p className="font-mono text-phantom-gold">
                  {camp.leaderboard_score as number} pts
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
