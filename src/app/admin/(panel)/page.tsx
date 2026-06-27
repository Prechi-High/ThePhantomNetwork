"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Analytics {
  revenue: {
    totalDepositsCents: number;
    totalEntryFeesCents: number;
    estimatedPlatformRevenueCents: number;
  };
  participation: {
    activeSessions: number;
    completedSessions: number;
    totalRegistrations: number;
  };
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Platform Overview</h1>
        <p className="text-phantom-muted">Monitor sessions, revenue, and growth</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-phantom-muted">Deposits</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">
            {data ? fmt(data.revenue.totalDepositsCents) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Entry Fees</p>
          <p className="font-mono text-2xl font-bold">{data ? fmt(data.revenue.totalEntryFeesCents) : "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Platform Revenue</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">
            {data ? fmt(data.revenue.estimatedPlatformRevenueCents) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-phantom-muted">Registrations</p>
          <p className="font-mono text-2xl font-bold">
            {data?.participation.totalRegistrations ?? "—"}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/sessions/new">
          <Card className="hover:border-phantom-gold/50">
            <p className="font-medium">Create Session</p>
            <p className="text-sm text-phantom-muted">Schedule a new game</p>
          </Card>
        </Link>
        <Link href="/admin/camps">
          <Card className="hover:border-phantom-gold/50">
            <p className="font-medium">Manage Camps</p>
            <p className="text-sm text-phantom-muted">Owners & referral codes</p>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="hover:border-phantom-gold/50">
            <p className="font-medium">User Moderation</p>
            <p className="text-sm text-phantom-muted">Roles & bans</p>
          </Card>
        </Link>
      </div>

      {data && (
        <Card>
          <div className="flex items-center gap-2">
            <Badge>{data.participation.activeSessions} active</Badge>
            <Badge variant="muted">{data.participation.completedSessions} completed</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
