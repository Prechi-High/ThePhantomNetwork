"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface RevenueEvent {
  id: string;
  amount_cents: number;
  event_type: string;
  created_at: string;
  sessions?: { title: string } | null;
  profiles?: { username: string } | null;
}

export default function CampRevenuePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/camp-owner/revenue")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const events = (data?.events as RevenueEvent[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Revenue</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-phantom-muted">Wallet Balance</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">
            ${(((data?.walletBalanceCents as number) ?? 0) / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Total Earned</p>
          <p className="font-mono text-2xl font-bold">
            ${(((data?.totalEarnedCents as number) ?? 0) / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Revenue Share</p>
          <p className="font-mono text-2xl font-bold">{data?.revenueSharePct as number}%</p>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Recent Events</p>
        {events.map((e) => (
          <Card key={e.id} className="flex justify-between text-sm">
            <div>
              <p>{e.profiles?.username ?? "Member"} joined {e.sessions?.title ?? "session"}</p>
              <p className="text-xs text-phantom-muted">
                {new Date(e.created_at).toLocaleString()}
              </p>
            </div>
            <p className="font-mono text-phantom-gold">+${(e.amount_cents / 100).toFixed(2)}</p>
          </Card>
        ))}
        {!events.length && (
          <Card>
            <p className="text-phantom-muted">
              Revenue accrues when camp members pay session entry fees.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
