"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { SpinWheel } from "@/components/gameplay/SpinWheel";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { FireBoostMeter } from "@/components/gameplay/FireBoostMeter";
import { RevivePanel } from "@/components/gameplay/RevivePanel";
import { PhaseTimer } from "@/components/layout/PhaseTimer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useGameplayStore } from "@/stores/useGameplayStore";
import { useStealStore } from "@/stores/useStealStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRealtimeSession } from "@/hooks/useRealtimeSession";
import type { StealTarget } from "@/types/gameplay";
import { SPIN_DURATION_MS } from "@/types/gameplay";

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { subSessionId, setSubSessionId } = useSessionStore();
  const {
    tokens,
    isSpinning,
    spinLocked,
    lastOutcome,
    isEliminated,
    isRevivable,
    setTokens,
    setSpinning,
    setSpinLocked,
    setLastOutcome,
  } = useGameplayStore();
  const {
    targets,
    stealInProgress,
    attackerId,
    fireBoostTaps,
    setTargets,
    setStealInProgress,
    incrementFireBoost,
    resetFireBoost,
  } = useStealStore();

  const [showStealPicker, setShowStealPicker] = useState(false);
  const [phaseEndsAt, setPhaseEndsAt] = useState(Date.now() + 6 * 60 * 1000);
  const [reviveTargetId, setReviveTargetId] = useState<string | null>(null);

  useRealtimeSession(subSessionId);

  const refreshState = useCallback(async () => {
    if (!subSessionId) return;
    const res = await fetch(`/api/gameplay/state?subSessionId=${subSessionId}`);
    const data = await res.json();
    if (data.player) {
      setTokens(Number(data.player.session_tokens));
      if (data.phaseEndsAt) setPhaseEndsAt(data.phaseEndsAt);
    }
  }, [subSessionId, setTokens]);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/my-sub-session`)
      .then((r) => r.json())
      .then((d) => {
        if (d.subSessionId) setSubSessionId(d.subSessionId);
      });
  }, [sessionId, setSubSessionId]);

  useEffect(() => {
    if (!subSessionId) return;
    refreshState();
    const id = setInterval(refreshState, 5000);
    return () => clearInterval(id);
  }, [subSessionId, refreshState]);

  const handleSpin = useCallback(async () => {
    if (!subSessionId || spinLocked) return;
    setSpinning(true);
    setSpinLocked(true);

    const res = await fetch("/api/gameplay/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId }),
    });
    const data = await res.json();

    if (data.outcome) {
      setLastOutcome(data.outcome);
      if (data.tokens !== undefined) setTokens(data.tokens);
      if (data.requiresTargetSelection) {
        const targetsRes = await fetch("/api/gameplay/steal/targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subSessionId }),
        });
        const targetsData = await targetsRes.json();
        setTargets(targetsData.targets ?? []);
        setShowStealPicker(true);
      }
    }
  }, [subSessionId, spinLocked, setSpinning, setSpinLocked, setLastOutcome, setTokens, setTargets]);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    setTimeout(() => setSpinLocked(false), 500);
  }, [setSpinning, setSpinLocked]);

  const handleStealSelect = async (target: StealTarget) => {
    await fetch("/api/gameplay/steal/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, victimId: target.userId }),
    });
    setShowStealPicker(false);
  };

  const handleResolveSteal = async () => {
    await fetch("/api/gameplay/steal/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, resolve: true }),
    });
    resetFireBoost();
    setStealInProgress(false);
  };

  const handleFireBoost = async () => {
    if (!attackerId) return;
    await fetch("/api/gameplay/steal/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subSessionId, attackerId }),
    });
    incrementFireBoost();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-phantom-bg">
      <header className="flex items-center justify-between border-b border-phantom-border p-4">
        <PhaseTimer endsAt={phaseEndsAt} label="Phase 1" />
        <div className="text-center">
          <p className="text-xs text-phantom-muted">Tokens</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">{tokens}</p>
        </div>
        {isEliminated && <Badge variant="danger">Eliminated</Badge>}
        {isRevivable && <Badge variant="gold">Revivable</Badge>}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <SpinWheel
          isSpinning={isSpinning}
          outcome={lastOutcome}
          onSpinComplete={handleSpinComplete}
        />

        {showStealPicker && (
          <StealTargetPicker
            targets={targets}
            onSelect={handleStealSelect}
            onCancel={() => setShowStealPicker(false)}
          />
        )}

        {stealInProgress && attackerId && (
          <Card className="flex items-center gap-6">
            <FireBoostMeter taps={fireBoostTaps} onTap={handleFireBoost} />
            <Button onClick={handleResolveSteal} variant="danger">
              Resolve Steal
            </Button>
          </Card>
        )}

        {isRevivable && reviveTargetId && (
          <RevivePanel
            targetUsername="Teammate"
            required={3}
            contributed={0}
            onContribute={async (amount) => {
              await fetch("/api/gameplay/revive/contribute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subSessionId,
                  targetUserId: reviveTargetId,
                  amount,
                }),
              });
              refreshState();
            }}
          />
        )}
      </main>

      <footer className="border-t border-phantom-border p-4">
        <Button
          onClick={handleSpin}
          disabled={isSpinning || spinLocked || isEliminated}
          className="w-full"
          size="lg"
        >
          {isSpinning ? "Spinning..." : spinLocked ? `Wait ${SPIN_DURATION_MS / 1000}s` : "SPIN"}
        </Button>
      </footer>
    </div>
  );
}
