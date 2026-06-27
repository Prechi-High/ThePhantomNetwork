"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CampOwnerDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/camp-owner/camp")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const camp = data?.camp as Record<string, unknown> | undefined;
  const stats = data?.stats as Record<string, number> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {(camp?.name as string) ?? "Camp Dashboard"}
        </h1>
        <p className="text-phantom-muted">Grow your community and track performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-phantom-muted">Members</p>
          <p className="font-mono text-2xl font-bold">{stats?.memberCount ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Camp Wallet</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">
            ${((stats?.walletBalanceCents ?? 0) / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Total Revenue</p>
          <p className="font-mono text-2xl font-bold">
            ${((stats?.totalRevenueCents ?? 0) / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Recent Activity</p>
          <p className="font-mono text-2xl font-bold">{stats?.recentParticipation ?? 0}</p>
        </Card>
      </div>

      {camp && (
        <Card>
          <div className="flex flex-wrap gap-2">
            <Badge>Code: {camp.referral_code as string}</Badge>
            <Badge variant="muted">{camp.revenue_share_pct as number}% share</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
