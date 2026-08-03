"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HeroFocus,
  PageShell,
  PrimaryCTA,
  SecondaryLink,
  StatPill,
} from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { PopupToast } from "@/components/ui/PopupToast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { MESSAGES } from "@/lib/brand/terminology";
import { authNetwork } from "@/lib/network";
import { appEvents } from "@/lib/motion/appEvents";

interface SessionResult {
  final_rank: number;
  final_tokens: number;
  session_id: string;
}

export default function SessionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfluence, setShowInfluence] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    authNetwork.getProfileSessions().then((historyRes) => {
      if (historyRes.ok) {
        const history = historyRes.data as { sessions?: SessionResult[] };
        const match = (history.sessions ?? []).find((s) => s.session_id === sessionId);
        if (match) setResult(match);
      }
      setLoading(false);
      setShowInfluence(true);
    });
  }, [sessionId]);

  const isWinner = result?.final_rank === 1;

  useEffect(() => {
    if (isWinner) {
      appEvents.emit({ type: "VICTORY", timestamp: Date.now(), source: "system" });
    }
  }, [isWinner]);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow={MESSAGES.sessionComplete}
        title={isWinner ? MESSAGES.victory : MESSAGES.defeat}
        subtitle={
          result
            ? `Rank #${result.final_rank} · ${result.final_tokens} session tokens`
            : "Results are being finalized."
        }
      >
        {result && (
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-3">
            <StatPill label="Rank" value={`#${result.final_rank}`} accent="gold" />
            <StatPill label="Tokens" value={result.final_tokens} accent="blue" />
          </div>
        )}
      </HeroFocus>

      <PrimaryCTA onClick={() => setShareOpen(true)}>Share replay</PrimaryCTA>
      <PrimaryCTA href="/legacy">View Legacy</PrimaryCTA>
      <SecondaryLink href="/home" className="block text-center">
        Return home
      </SecondaryLink>

      <PopupToast
        open={showInfluence}
        kind="influence"
        title="+ Legacy Influence"
        subtitle="Consistency compounds"
        onDismiss={() => setShowInfluence(false)}
      />

      <BottomSheet open={shareOpen} onOpenChange={setShareOpen} title="Share replay">
        <p className="mb-4 text-sm text-legacy-muted">
          Export with LEGACIES watermark, player identity, and referral link.
        </p>
        <Button className="w-full" onClick={() => { setShareOpen(false); router.push("/creator"); }}>
          Open Creator Hub
        </Button>
      </BottomSheet>
    </PageShell>
  );
}
