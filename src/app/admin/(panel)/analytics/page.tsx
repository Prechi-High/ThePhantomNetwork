"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [platformFee, setPlatformFee] = useState("15");
  const [entryFee, setEntryFee] = useState("5");
  const [campShare, setCampShare] = useState("5");
  const [switchLevel, setSwitchLevel] = useState("5");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setAnalytics);
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d.config);
        if (d.config) {
          setPlatformFee(String(d.config.default_platform_fee_pct));
          setEntryFee(String((d.config.default_entry_fee_cents as number) / 100));
          setCampShare(String(d.config.default_camp_revenue_share_pct));
          setSwitchLevel(String(d.config.camp_switch_level));
        }
      });
  }, []);

  const saveConfig = async () => {
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_platform_fee_pct: parseFloat(platformFee),
        default_entry_fee_cents: Math.round(parseFloat(entryFee) * 100),
        default_camp_revenue_share_pct: parseFloat(campShare),
        camp_switch_level: parseInt(switchLevel, 10),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const rev = analytics?.revenue as Record<string, number> | undefined;
  const part = analytics?.participation as Record<string, number> | undefined;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Analytics & Economy</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-2 font-medium">Revenue</p>
          {rev ? (
            <ul className="space-y-1 text-sm text-phantom-muted">
              <li>Deposits: {fmt(rev.totalDepositsCents)}</li>
              <li>Entry fees: {fmt(rev.totalEntryFeesCents)}</li>
              <li>Rewards paid: {fmt(rev.totalRewardsCents)}</li>
              <li className="text-phantom-gold">
                Est. platform revenue: {fmt(rev.estimatedPlatformRevenueCents)}
              </li>
            </ul>
          ) : (
            <p className="text-phantom-muted">Loading...</p>
          )}
        </Card>
        <Card>
          <p className="mb-2 font-medium">Participation</p>
          {part ? (
            <ul className="space-y-1 text-sm text-phantom-muted">
              <li>Active sessions: {part.activeSessions}</li>
              <li>Completed: {part.completedSessions}</li>
              <li>Total registrations: {part.totalRegistrations}</li>
            </ul>
          ) : (
            <p className="text-phantom-muted">Loading...</p>
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <p className="font-medium">Platform Defaults</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-phantom-muted">Platform fee (%)</label>
            <input
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-phantom-muted">Default entry fee ($)</label>
            <input
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-phantom-muted">Camp revenue share (%)</label>
            <input
              value={campShare}
              onChange={(e) => setCampShare(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-phantom-muted">Camp switch level</label>
            <input
              value={switchLevel}
              onChange={(e) => setSwitchLevel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
            />
          </div>
        </div>
        <Button onClick={saveConfig} size="sm">
          {saved ? "Saved!" : "Save Defaults"}
        </Button>
        {config && (
          <p className="text-xs text-phantom-muted">
            Last updated: {new Date(config.updated_at as string).toLocaleString()}
          </p>
        )}
      </Card>
    </div>
  );
}
