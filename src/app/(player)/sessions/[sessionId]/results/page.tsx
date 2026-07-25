"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import BottomNav from "@/components/ui/BottomNav";
import { MESSAGES, CURRENCY } from "@/lib/brand/terminology";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";

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
  const [stats, setStats] = useState({
    steals: 0,
    blocked: 0,
    counterstrikes: 0,
    assetsUsed: 0,
    assetsRemaining: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/profile/sessions").then((r) => r.json()),
      fetch(`/api/armory/inventory?sessionId=${sessionId}`).then((r) => r.json()).catch(() => ({})),
    ]).then(([historyRes]) => {
      const match = (historyRes.sessions ?? []).find(
        (s: SessionResult & { session_id: string }) => s.session_id === sessionId
      );
      if (match) setResult(match);
    });
  }, [sessionId]);

  const isWinner = result?.final_rank === 1;

  return (
    <div className="min-h-screen bg-phantom-bg pb-24">
      <div className="container-responsive pt-8 space-y-6">
        <div className="text-center">
          <motionReveal>
            <h1 className="font-display text-3xl font-bold text-phantom-gold">
              {isWinner ? MESSAGES.victory : MESSAGES.defeat}
            </h1>
            <p className="text-phantom-muted mt-2">
              {isWinner
                ? MESSAGES.legacyRecord
                : "Your legacy continues. Prepare and return stronger."}
            </p>
          </motionReveal>
        </div>

        {result && (
          <Card className="space-y-4">
            <div className="flex justify-between">
              <span className="text-phantom-muted">Final Rank</span>
              <span className="text-2xl font-bold">#{result.final_rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-phantom-muted">{CURRENCY.session}</span>
              <span className="font-bold">{result.final_tokens}</span>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-semibold mb-3">Combat Statistics</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-phantom-muted">Steals Executed</span>
              <span>{stats.steals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-phantom-muted">Attacks Blocked</span>
              <span>{stats.blocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-phantom-muted">Counterstrikes</span>
              <span>{stats.counterstrikes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-phantom-muted">Tactical Assets Used</span>
              <span>{stats.assetsUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-phantom-muted">Assets Remaining</span>
              <span>{stats.assetsRemaining}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Tactical Assets</h2>
          <p className="text-xs text-phantom-muted mb-3">
            {(Object.keys(TACTICAL_ASSET_DEFS) as (keyof typeof TACTICAL_ASSET_DEFS)[]).map((s) => TACTICAL_ASSET_DEFS[s].displayName).join(" · ")}
          </p>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => router.push("/sessions")}>
            Return to Sessions
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => router.push("/armory")}>
            Prepare Next Battle
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function motionReveal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
