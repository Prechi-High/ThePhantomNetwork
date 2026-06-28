"use client";

import { useState } from "react";
import { PremiumWheel, ButtonAnimator } from "@/components/gameplay/premium-wheel";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { FireBoostMeter } from "@/components/gameplay/FireBoostMeter";
import { RevivePanel } from "@/components/gameplay/RevivePanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";
import type { SpinOutcome, StealTarget } from "@/types/gameplay";

function formatPhaseTimer(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SquadMember {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface LeaderboardEntry {
  user_id: string;
  session_tokens: number;
  profiles?: { username: string } | null;
}

interface GameplayArenaProps {
  phase: number;
  round: number;
  maxRounds: number;
  phaseEndsAt: number | null;
  tokens: number;
  playerRank: number;
  totalPlayers: number;
  isEliminated: boolean;
  isRevivable: boolean;
  isSpinning: boolean;
  spinLocked: boolean;
  lastOutcome: SpinOutcome | null;
  squadMembers: SquadMember[];
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  showStealPicker: boolean;
  stealTargets: StealTarget[];
  stealInProgress: boolean;
  attackerId: string | null;
  fireBoostTaps: number;
  reviveTargetId: string | null;
  onSpin: () => void;
  onSpinComplete: () => void;
  onStealSelect: (target: StealTarget) => void;
  onStealCancel: () => void;
  onResolveSteal: () => void;
  onFireBoost: () => void;
  onReviveContribute: (amount: number) => Promise<void>;
}

export function GameplayArena({
  phase,
  round,
  maxRounds,
  phaseEndsAt,
  tokens,
  playerRank,
  totalPlayers,
  isEliminated,
  isRevivable,
  isSpinning,
  spinLocked,
  lastOutcome,
  squadMembers,
  leaderboard,
  currentUserId,
  showStealPicker,
  stealTargets,
  stealInProgress,
  attackerId,
  fireBoostTaps,
  reviveTargetId,
  onSpin,
  onSpinComplete,
  onStealSelect,
  onStealCancel,
  onResolveSteal,
  onFireBoost,
  onReviveContribute,
}: GameplayArenaProps) {
  const remaining = usePhaseTimer(phaseEndsAt);
  const [showSquad, setShowSquad] = useState(false);
  const [showBoard, setShowBoard] = useState(false);

  const liveSquad = squadMembers.filter((m) => !m.is_eliminated).length;
  const elimSquad = squadMembers.filter((m) => m.is_eliminated).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-phantom-bg">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-[radial-gradient(circle,_rgba(96,165,250,0.15)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 right-0 h-40 w-40 bg-[radial-gradient(circle,_rgba(212,168,83,0.12)_0%,_transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 grid grid-cols-3 gap-2 border-b border-phantom-border/80 bg-phantom-surface/60 px-3 py-2 backdrop-blur-sm">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-phantom-muted">
            Phase {phase} · Round {round}/{maxRounds}
          </p>
          <p className="text-xs text-phantom-gold">
            <span className="text-phantom-muted">TOK</span> {tokens}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[9px] uppercase tracking-widest text-phantom-muted">Session</p>
          <p className="font-mono text-lg font-bold text-phantom-gold">
            {phaseEndsAt != null ? formatPhaseTimer(remaining) : "—"}
          </p>
          <p className="font-display text-[10px] font-bold tracking-wider text-phantom-gold/80">
            THE PHANTOM
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-phantom-muted">Rank</p>
          <p className="font-mono text-sm font-bold text-phantom-gold">#{playerRank || "—"}</p>
          <p className="text-[9px] text-phantom-muted">
            {liveSquad} live / {elimSquad} elim
          </p>
        </div>
      </header>

      {/* Mobile toggles */}
      <div className="relative z-10 flex gap-2 border-b border-phantom-border/50 px-3 py-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setShowSquad((v) => !v)}
          className="flex-1 rounded border border-phantom-border py-1 text-[10px] uppercase tracking-wider text-phantom-muted"
        >
          Squad
        </button>
        <button
          type="button"
          onClick={() => setShowBoard((v) => !v)}
          className="flex-1 rounded border border-phantom-border py-1 text-[10px] uppercase tracking-wider text-phantom-muted"
        >
          Leaderboard
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Squad panel */}
        <aside
          className={`${
            showSquad ? "absolute inset-x-0 top-0 z-20 max-h-[45%]" : "hidden"
          } w-full shrink-0 overflow-y-auto border-r border-phantom-border/50 bg-phantom-surface/95 p-3 lg:relative lg:block lg:max-h-none lg:w-44 lg:bg-phantom-surface/40 xl:w-52`}
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-phantom-gold">
            Your Squad
          </p>
          <ul className="space-y-2">
            {squadMembers.map((m) => {
              const name = m.profiles?.username ?? "Player";
              const eliminated = m.is_eliminated;
              const revivable = m.is_revivable;
              return (
                <li
                  key={m.user_id}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    eliminated
                      ? "border-phantom-danger/40 bg-phantom-danger/5"
                      : "border-phantom-border/60 bg-phantom-bg/40"
                  }`}
                >
                  <div
                    className={`h-7 w-7 shrink-0 rounded-full border-2 ${
                      eliminated ? "border-phantom-danger" : "border-emerald-500/60"
                    } bg-phantom-border`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">@{name}</p>
                    <p className="text-[10px] text-phantom-muted">
                      {eliminated
                        ? revivable
                          ? "+ Revivable"
                          : "Eliminated"
                        : `${m.session_tokens} TOK`}
                    </p>
                  </div>
                </li>
              );
            })}
            {squadMembers.length === 0 && (
              <li className="text-xs text-phantom-muted">Solo — no squad</li>
            )}
          </ul>
        </aside>

        {/* Main arena */}
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-3 sm:p-4">
          {(isEliminated || isRevivable) && (
            <div className="flex gap-2">
              {isEliminated && <Badge variant="danger">Eliminated</Badge>}
              {isRevivable && <Badge variant="gold">Revivable</Badge>}
            </div>
          )}

          <div className="relative">
            <PremiumWheel
              isSpinning={isSpinning}
              outcome={lastOutcome}
              onSpinComplete={onSpinComplete}
            />
          </div>

          {showStealPicker && (
            <StealTargetPicker
              targets={stealTargets}
              onSelect={onStealSelect}
              onCancel={onStealCancel}
            />
          )}

          {stealInProgress && attackerId && (
            <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-phantom-danger/40 bg-phantom-surface/80 p-3">
              <FireBoostMeter taps={fireBoostTaps} onTap={onFireBoost} />
              <Button onClick={onResolveSteal} variant="danger" size="sm">
                Resolve Steal
              </Button>
            </div>
          )}

          {isRevivable && reviveTargetId && (
            <RevivePanel
              targetUsername="Teammate"
              required={3}
              contributed={0}
              onContribute={onReviveContribute}
            />
          )}

          {remaining === 0 && phaseEndsAt != null && (
            <p className="animate-pulse text-xs text-phantom-gold">
              Phase ending — syncing with network...
            </p>
          )}
        </main>

        {/* Leaderboard */}
        <aside
          className={`${
            showBoard ? "absolute inset-x-0 bottom-16 z-20 max-h-[40%]" : "hidden"
          } w-full shrink-0 overflow-y-auto border-l border-phantom-border/50 bg-phantom-surface/95 p-3 lg:relative lg:block lg:max-h-none lg:w-44 lg:bg-phantom-surface/40 xl:w-52`}
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-phantom-gold">
            Live Players
          </p>
          <ul className="space-y-1">
            {leaderboard.slice(0, 10).map((p, i) => {
              const isYou = p.user_id === currentUserId;
              return (
                <li
                  key={p.user_id}
                  className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                    isYou ? "border border-phantom-gold/50 bg-phantom-gold/10" : ""
                  }`}
                >
                  <span className="truncate text-phantom-muted">#{i + 1}</span>
                  <span className="mx-1 flex-1 truncate">
                    {isYou ? "You" : p.profiles?.username ?? "Player"}
                  </span>
                  <span className="font-mono text-phantom-gold">{p.session_tokens}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[9px] text-phantom-muted">{totalPlayers} in session</p>
        </aside>
      </div>

      {/* Power-ups bar + spin */}
      <footer className="relative z-10 border-t border-phantom-border/80 bg-phantom-surface/80 px-3 py-3 backdrop-blur-sm">
        <div className="mb-3 flex justify-center gap-2 overflow-x-auto pb-1">
          {["Magnet", "Heart", "Insurance", "Shield", "Boost"].map((label) => (
            <div
              key={label}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-phantom-border/60 bg-phantom-bg/60 text-[8px] text-phantom-muted"
              title={label}
            >
              {label.slice(0, 2)}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <ButtonAnimator
            state={
              isEliminated ? "idle" :
              isSpinning ? "cooldown" :
              spinLocked ? "cooldown" : "idle"
            }
            disabled={isSpinning || spinLocked || isEliminated}
            onClick={onSpin}
          />
        </div>
      </footer>
    </div>
  );
}
