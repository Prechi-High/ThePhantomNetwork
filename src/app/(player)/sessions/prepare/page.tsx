"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BottomNav from "@/components/ui/BottomNav";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import { CURRENCY, MESSAGES } from "@/lib/brand/terminology";

function PrepareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const sessionType = searchParams.get("type") ?? "public";

  const [session, setSession] = useState<{
    title: string;
    entry_fee_cents: number;
    total_pool_cents: number;
    starts_at: string;
  } | null>(null);
  const [loadout, setLoadout] = useState<{ assetSlug: string; quantity: number }[]>([]);
  const [legacyCredits, setLegacyCredits] = useState(0);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then((r) => r.json()),
      fetch("/api/armory/loadouts").then((r) => r.json()),
      fetch("/api/armory/inventory").then((r) => r.json()),
    ]).then(([sessRes, loadRes, invRes]) => {
      setSession(sessRes.session);
      setLegacyCredits(invRes.legacyCredits ?? 0);
      const active = (loadRes.loadouts ?? []).find((l: { isActive: boolean }) => l.isActive);
      setLoadout(active?.items ?? []);
    });
  }, [sessionId]);

  const handleEnterBattle = async () => {
    if (!sessionId) return;
    setJoining(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/join`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to join");
      setJoining(false);
      return;
    }
    router.push(`/sessions/${sessionId}/lobby`);
  };

  if (!sessionId) {
    return (
      <Card>
        <p className="text-sm text-phantom-muted">Select a session first.</p>
        <Button className="mt-4" onClick={() => router.push("/sessions")}>
          Browse Sessions
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Final Preparation</h1>
        <p className="text-sm text-phantom-muted">Review your loadout before entering battle.</p>
      </div>

      {session && (
        <Card className="space-y-3">
          <div className="flex justify-between">
            <span className="text-phantom-muted">Session</span>
            <span className="font-medium">{session.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Type</span>
            <Badge variant="purple">{sessionType.replace("_", " ")}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Entry Fee</span>
            <span>${(session.entry_fee_cents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Reward Pool</span>
            <span className="text-phantom-gold">${(session.total_pool_cents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">{CURRENCY.legacy} Remaining</span>
            <span>{legacyCredits}</span>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold mb-3">Active Loadout</h2>
        {loadout.length === 0 ? (
          <p className="text-sm text-phantom-muted">
            No loadout equipped. Visit the Armory to prepare.
          </p>
        ) : (
          <div className="space-y-2">
            {loadout.map((item) => (
              <div key={item.assetSlug} className="flex justify-between text-sm">
                <span>
                  {TACTICAL_ASSET_DEFS[item.assetSlug as keyof typeof TACTICAL_ASSET_DEFS]?.displayName ??
                    item.assetSlug}
                </span>
                <span>×{item.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-phantom-danger">{error}</p>}

      <Button
        className="w-full"
        size="lg"
        disabled={joining || loadout.length === 0}
        onClick={handleEnterBattle}
      >
        {joining ? "Entering..." : MESSAGES.enterBattle}
      </Button>

      <Button variant="ghost" className="w-full" onClick={() => router.push("/armory")}>
        Edit Loadout in Armory
      </Button>
    </div>
  );
}

export default function PreparePage() {
  return (
    <div className="min-h-screen bg-phantom-bg pb-24">
      <div className="container-responsive pt-4">
        <Suspense fallback={<p className="text-phantom-muted">Loading...</p>}>
          <PrepareContent />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}
