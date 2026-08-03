"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeroFocus,
  PageShell,
  PrimaryCTA,
  SectionLabel,
} from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { Button } from "@/components/ui/Button";
import { MESSAGES, CURRENCY, getAssetDisplayName } from "@/lib/brand/terminology";
import { sessionNetwork, economyNetwork } from "@/lib/network";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    Promise.all([
      sessionNetwork.getSession(sessionId),
      economyNetwork.getArmoryLoadouts(),
      economyNetwork.getArmoryInventory(),
    ]).then(([sessRes, loadRes, invRes]) => {
      const sessData = sessRes.ok ? (sessRes.data as { session?: typeof session }) : {};
      const loadData = loadRes.ok
        ? (loadRes.data as { loadouts?: Array<{ isActive: boolean; items: typeof loadout }> })
        : {};
      const invData = invRes.ok ? (invRes.data as { legacyCredits?: number }) : {};
      setSession(sessData.session ?? null);
      setLegacyCredits(invData.legacyCredits ?? 0);
      const active = (loadData.loadouts ?? []).find((l) => l.isActive);
      setLoadout(active?.items ?? []);
    }).finally(() => setLoading(false));
  }, [sessionId]);

  const handleEnterBattle = async () => {
    if (!sessionId) return;
    if (sessionType === "ai_practice") {
      router.push(`/play/${sessionId}`);
      return;
    }
    setJoining(true);
    setError(null);
    const result = await sessionNetwork.joinSession(sessionId);
    if (!result.ok) {
      setError(result.error.message ?? "Failed to join");
      setJoining(false);
      return;
    }
    router.push(`/sessions/${sessionId}/lobby`);
  };

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (!sessionId) {
    return (
      <PageShell className="space-y-4">
        <HeroFocus title="No session selected" subtitle="Pick an arena first." />
        <PrimaryCTA href="/sessions">Browse Sessions</PrimaryCTA>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow={MESSAGES.prepareForBattle}
        title={session?.title ?? "Loadout"}
        subtitle={
          session
            ? `Entry $${(session.entry_fee_cents / 100).toFixed(2)} · ${CURRENCY.legacy}: ${legacyCredits}`
            : "Review your loadout before entering."
        }
      />

      <section className="space-y-2">
        <SectionLabel>Active loadout</SectionLabel>
        {loadout.length === 0 ? (
          <ScreenState
            variant="empty"
            title="No loadout equipped"
            message="Equip tactical assets before battle."
            action={
              <Button variant="secondary" onClick={() => router.push("/armory")}>
                Open Armory
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {loadout.map((item) => (
              <li
                key={item.assetSlug}
                className="flex justify-between rounded-xl border border-legacy-divider bg-legacy-card px-4 py-3 text-sm"
              >
                <span className="text-white">{getAssetDisplayName(item.assetSlug)}</span>
                <span className="text-legacy-gold">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-legacy-crimson">{error}</p>}

      <PrimaryCTA onClick={handleEnterBattle} disabled={joining || loadout.length === 0}>
        {joining ? "Joining..." : MESSAGES.enterBattle}
      </PrimaryCTA>
    </PageShell>
  );
}

export default function PreparePage() {
  return (
    <Suspense fallback={<PageShell><ScreenState variant="loading" /></PageShell>}>
      <PrepareContent />
    </Suspense>
  );
}
