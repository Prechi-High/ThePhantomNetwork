"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Camp {
  id: string;
  name: string;
  slug: string;
  referral_code: string;
  member_count: number;
  revenue_share_pct: number;
  owner_id: string | null;
}

export default function AdminCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/admin/camps")
      .then((r) => r.json())
      .then((d) => setCamps(d.camps ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setError("");
    const res = await fetch("/api/admin/camps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        referral_code: referralCode || undefined,
        owner_id: ownerId || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setName("");
      setReferralCode("");
      setOwnerId("");
      load();
      return;
    }
    setError(data.error ?? "Failed to create camp");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Camps</h1>

      <Card className="space-y-3">
        <p className="font-medium">Create Camp</p>
        <input
          placeholder="Camp name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
        />
        <input
          placeholder="Referral code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
        />
        <input
          placeholder="Owner user ID (optional)"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2 text-xs font-mono"
        />
        {error && <p className="text-sm text-phantom-danger">{error}</p>}
        <Button onClick={handleCreate} size="sm">
          Create Camp
        </Button>
      </Card>

      <div className="space-y-3">
        {camps.map((camp) => (
          <Card key={camp.id}>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{camp.name}</p>
                <p className="text-xs text-phantom-muted">
                  Code: {camp.referral_code} · {camp.member_count} members ·{" "}
                  {camp.revenue_share_pct}% revenue share
                </p>
                <p className="text-xs text-phantom-muted">
                  Owner ID: {camp.owner_id ?? "Unassigned"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
