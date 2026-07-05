"use client";

import { useState, useEffect } from "react";
import { PremiumWheel, ButtonAnimator } from "@/components/gameplay/premium-wheel";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { FireBoostMeter } from "@/components/gameplay/FireBoostMeter";
import { RevivePanel } from "@/components/gameplay/RevivePanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";
import type { SpinOutcome, StealTarget } from "@/types/gameplay";
import { AnimatedAvatar } from "@/components/avatar";
import {
  Zap,
  Shield,
  UserMinus,
  Umbrella,
  Volume2,
  Users,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  totalPoolCents?: number | null;
  onSpin: () => void;
  onSpinComplete: () => void;
  onStealSelect: (target: StealTarget) => void;
  onStealCancel: () => void;
  onResolveSteal: () => void;
  onFireBoost: () => void;
  onReviveContribute: (amount: number) => Promise<void>;
}

// Mock live feed data for demonstration


// Mock skill data with cooldowns/ready states
const skills = [
  { id: "steal", name: "Steal Boost", icon: Zap, color: "text-purple-500", bg: "bg-purple-900/30", border: "border-purple-500/50", ready: true },
  { id: "shield", name: "Shield", icon: Shield, color: "text-cyan-500", bg: "bg-cyan-900/30", border: "border-cyan-500/50", ready: true },
  { id: "cloak", name: "Cloak", icon: UserMinus, color: "text-purple-400", bg: "bg-purple-900/30", border: "border-purple-400/50", ready: false, cooldown: "15s" },
  { id: "insurance", name: "Insurance", icon: Umbrella, color: "text-yellow-500", bg: "bg-yellow-900/30", border: "border-yellow-500/50", ready: true },
];

interface LiveFeedEvent {
  id?: number;
  event_type?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

interface Squad {
  id: string;
  name: string;
  squad_tokens: number;
  is_permanent?: boolean;
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
  totalPoolCents,
  onSpin,
  onSpinComplete,
  onStealSelect,
  onStealCancel,
  onResolveSteal,
  onFireBoost,
  onReviveContribute,
}: GameplayArenaProps) {
  const remaining = usePhaseTimer(phaseEndsAt);
  const [showSquad, setShowSquad] = useState(true); // Default to showing squad panel
  const [liveFeedEvents, setLiveFeedEvents] = useState<LiveFeedEvent[]>([]);
  const [topSquads, setTopSquads] = useState<Squad[]>([]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [feedRes, squadsRes] = await Promise.all([
          fetch("/api/live-feed"),
          fetch("/api/squads/leaderboard"),
        ]);
        const feedJson = await feedRes.json();
        const squadsJson = await squadsRes.json();
        setLiveFeedEvents(feedJson.events);
        setTopSquads(squadsJson.squads);
      } catch {
        // ignore errors
      }
    }
    loadData();
  }, []);

  // Realtime feed updates
  useEffect(() => {
    const es = new EventSource("/api/live-feed/stream");
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        setLiveFeedEvents((prev) => [
          { ...data, created_at: new Date().toISOString() } as LiveFeedEvent,
          ...prev.slice(0, 29),
        ]);
      } catch {
        // ignore parse errors
      }
    };
    return () => es.close();
  }, []);

  const liveSquad = squadMembers.filter((m) => !m.is_eliminated).length;
  const highestTokens = Math.max(...leaderboard.map((p) => p.session_tokens), 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Purple gradient blobs */}
        <div className="absolute -top-20 -left-20 h-80 w-80 bg-[radial-gradient(circle,_rgba(147,51,234,0.3)_0%,_transparent_60%)] animate-float" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 bg-[radial-gradient(circle,_rgba(139,92,246,0.25)_0%,_transparent_60%)] animate-float" style={{ animationDelay: "1.5s" }} />
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]" />
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 flex h-full flex-col">
        {/* TOP HUD */}
        <header className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
          {/* Left: Price Pool & Alive */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {/* Price Pool */}
            <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl">$</span>
                <div>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">PRIZE POOL</p>
                  <p className="text-base sm:text-xl font-mono font-bold text-white">
                    {totalPoolCents != null
                      ? `$${(totalPoolCents / 100).toLocaleString()}`
                      : "$0"}
                  </p>
                </div>
              </div>
            </div>
            {/* Alive Players */}
            <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <div>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">ALIVE</p>
                  <p className="text-base sm:text-xl font-mono font-bold text-white">{totalPlayers || 28}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Phase & Timer */}
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm font-bold text-purple-500">PHASE {phase}/{6}</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-white">
              {phaseEndsAt != null ? formatPhaseTimer(remaining) : "02:45"}
            </p>
          </div>

          {/* Right: My Rank & Voice Widget */}
          <div className="flex flex-col items-end gap-1.5 sm:gap-2">
            {/* Voice Widget */}
            <div className="glass rounded-full border border-phantom-border/60 px-2.5 py-1.5 sm:px-3 sm:py-2">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            {/* My Rank */}
            <div className="glass rounded-xl border border-phantom-border/60 px-3 py-1.5 sm:px-4 sm:py-2 text-right">
              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-phantom-muted">MY RANK</p>
              <p className="text-base sm:text-xl font-mono font-bold text-purple-400">#{playerRank || 7}</p>
            </div>
          </div>
        </header>

        {/* MAIN GAME AREA - Responsive layout: vertical on mobile, 3 columns on larger screens */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* CENTER: Wheel and main interaction (priority on mobile) */}
          <main className="flex-1 flex flex-col items-center justify-center px-3 py-3 sm:px-2 sm:py-4 relative order-1">
            {/* Status badges */}
            <div className="flex gap-2 mb-3 sm:mb-4">
              {isEliminated && <Badge variant="danger" className="text-xs py-1 px-3">Eliminated</Badge>}
              {isRevivable && <Badge variant="gold" className="text-xs py-1 px-3">Revivable</Badge>}
            </div>

            {/* Spin Wheel - Adjust size for mobile */}
            <div className="relative animate-float mb-4 sm:mb-6">
              <div className="transform scale-75 sm:scale-100">
                <PremiumWheel
                  isSpinning={isSpinning}
                  outcome={lastOutcome}
                  onSpinComplete={onSpinComplete}
                />
              </div>
            </div>

            {/* Steal picker */}
            {showStealPicker && (
              <StealTargetPicker
                targets={stealTargets}
                onSelect={onStealSelect}
                onCancel={onStealCancel}
              />
            )}

            {/* Fire boost */}
            {stealInProgress && attackerId && (
              <div className="flex w-full max-w-sm flex-col items-center gap-3 glass rounded-lg p-3">
                <FireBoostMeter taps={fireBoostTaps} onTap={onFireBoost} />
                <Button onClick={onResolveSteal} variant="danger" size="sm">
                  Resolve Steal
                </Button>
              </div>
            )}

            {/* Revive panel */}
            {isRevivable && reviveTargetId && (
              <RevivePanel
                targetUsername="Teammate"
                required={3}
                contributed={0}
                onContribute={onReviveContribute}
              />
            )}

            {/* Spin count indicator */}
            <div className="text-center mb-3 sm:mb-4">
              <p className="text-[10px] sm:text-xs text-phantom-muted mb-1">TAP TO SPIN</p>
              <p className="text-xs sm:text-sm font-mono font-bold text-purple-400">{spinCount}/5 SPINS</p>
            </div>

            {/* Skill Dock */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              {skills.map((skill) => (
                <div key={skill.id} className="flex flex-col items-center">
                  <button
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 flex items-center justify-center ${skill.bg} ${skill.border} ${
                      skill.ready ? "hover:scale-105 transition-transform" : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!skill.ready}
                  >
                    <skill.icon className={`w-5.5 h-5.5 sm:w-7 sm:h-7 ${skill.color}`} />
                  </button>
                  {skill.cooldown && (
                    <span className="text-[8px] sm:text-[9px] text-phantom-muted mt-1">{skill.cooldown}</span>
                  )}
                  <span className="text-[7px] sm:text-[8px] text-phantom-muted uppercase mt-0.5">{skill.name}</span>
                </div>
              ))}
            </div>

            {/* Spin Button */}
            <div className="flex flex-col items-center gap-2">
              <div className="transform scale-90 sm:scale-100">
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
            </div>

            {/* Speed control - Hide on small mobile */}
            <div className="hidden sm:block absolute right-6 bottom-8 glass rounded-lg px-3 py-2 border border-phantom-border/50">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-phantom-muted" />
                <span className="text-[9px] text-phantom-muted uppercase">x1 Speed</span>
              </div>
            </div>
          </main>

          {/* BOTTOM ROW ON MOBILE: Live Feed + Squad Panel (side by side) */}
          <div className="flex flex-row flex-1 lg:hidden gap-2 px-3 pb-2 overflow-hidden">
            {/* LEFT: Live Feed */}
            <aside className="flex-1 flex flex-col min-w-0">
              <div className="mb-1.5 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[8px] font-bold uppercase tracking-wider text-phantom-muted">
                  LIVE FEED
                </p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pb-2">
              {liveFeedEvents.slice(0, 3).map((event, index) => (
                <div key={event.id || index} className="glass rounded-lg border border-phantom-border/50 px-2 py-1.5 text-[8px]">
                  <div className="flex items-center gap-1">
                    {event.event_type === "steal" && (
                      <span className="text-purple-400">💜</span>
                    )}
                    {event.event_type === "revive" && (
                      <span className="text-green-400">💚</span>
                    )}
                    {event.event_type === "eliminate" && (
                      <span className="text-red-400">💀</span>
                    )}
                    {event.event_type === "camp" && (
                      <span className="text-yellow-400">⭐</span>
                    )}
                    {event.event_type === "advance" && (
                      <span className="text-green-400">✨</span>
                    )}
                    <span className="font-semibold text-white truncate">
                      {event.message || "New event"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </aside>

            {/* RIGHT: Squad Panel */}
            <aside className="flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-phantom-purple-bright">
                  SQUADS
                </p>
                <button
                  onClick={() => setShowSquad(!showSquad)}
                  className="text-phantom-muted"
                >
                  {showSquad ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showSquad && (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {/* Your Squad */}
                  <div>
                    <p className="text-[7px] uppercase tracking-wider text-phantom-muted mb-1">
                      YOUR SQUAD
                    </p>
                    <ul className="space-y-1.5">
                      {squadMembers.slice(0, 2).map((m) => {
                        const name = m.profiles?.username ?? "Player";
                        const eliminated = m.is_eliminated;

                        return (
                          <li
                            key={m.user_id}
                            className={`flex items-center gap-1.5 glass rounded-lg px-1.5 py-1 ${
                              eliminated
                                ? "border-red-900/40"
                                : "border-phantom-border/60"
                            }`}
                          >
                            <AnimatedAvatar
                              states={[eliminated ? "ELIMINATED" : "DEFAULT"]}
                              size="sm"
                              tokens={eliminated ? undefined : m.session_tokens}
                              online={!eliminated}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[8px] font-medium text-white">@{name}</p>
                              <p className="text-[7px] text-phantom-muted">
                                {eliminated ? "Elim" : `${m.session_tokens}`}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Top Squads */}
                  <div>
                    <p className="text-[7px] uppercase tracking-wider text-phantom-muted mb-1">
                      TOP SQUADS
                    </p>
                    <ul className="space-y-1.5">
                      {topSquads.slice(0, 2).map((squad, index) => (
                        <li
                          key={squad.id}
                          className="flex items-center justify-between glass rounded-lg px-1.5 py-1 border border-phantom-border/60"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-mono text-phantom-muted">{index + 1}</span>
                            <p className="text-[8px] font-semibold text-white truncate">{squad.name}</p>
                          </div>
                          <span className="text-[7px] font-mono text-yellow-500">{Number(squad.squad_tokens).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* DESKTOP VIEW: Full Live Feed + Squad Panel */}
          {/* LEFT: Live Feed - Desktop */}
          <aside className="hidden lg:flex w-[26%] max-w-[220px] flex-shrink-0 px-3 overflow-hidden flex-col order-0">
            <div className="mb-2 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-phantom-muted">
                LIVE FEED
              </p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pb-4">
              {liveFeedEvents.slice(0, 30).map((event, index) => (
                <div key={event.id || index} className="glass rounded-lg border border-phantom-border/50 px-3 py-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {event.event_type === "steal" && (
                      <span className="text-purple-400">💜</span>
                    )}
                    {event.event_type === "revive" && (
                      <span className="text-green-400">💚</span>
                    )}
                    {event.event_type === "eliminate" && (
                      <span className="text-red-400">💀</span>
                    )}
                    {event.event_type === "camp" && (
                      <span className="text-yellow-400">⭐</span>
                    )}
                    {event.event_type === "advance" && (
                      <span className="text-green-400">✨</span>
                    )}
                    <span className="font-semibold text-white truncate">
                      {event.message || "New event"}
                    </span>
                    {event.created_at && (
                      <span className="text-phantom-muted ml-auto text-[9px]">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {liveFeedEvents.length > 30 && (
                <button className="w-full text-center text-[10px] text-purple-400 hover:text-purple-300">
                  View All
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT: Squad Panel - Desktop */}
          <aside className="hidden lg:flex w-[26%] max-w-[220px] flex-shrink-0 px-3 overflow-hidden flex flex-col order-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-phantom-purple-bright">
                SQUADS
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Your Squad */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-phantom-muted mb-2">
                  YOUR SQUAD
                </p>
                <ul className="space-y-2">
                  {squadMembers.slice(0, 3).map((m) => {
                    const name = m.profiles?.username ?? "Player";
                    const eliminated = m.is_eliminated;
                    const revivable = m.is_revivable;
                    const winning = m.session_tokens === highestTokens;

                    const states: ProfileSpriteState[] = [];
                    if (eliminated) states.push("ELIMINATED");
                    if (revivable) states.push("REVIVING");
                    if (winning) states.push("WINNING");
                    if (states.length === 0) states.push("DEFAULT");

                    return (
                      <li
                        key={m.user_id}
                        className={`flex items-center gap-2 glass rounded-lg px-2 py-2 ${
                          eliminated
                            ? "border-red-900/40"
                            : "border-phantom-border/60"
                        }`}
                      >
                        <AnimatedAvatar
                          states={states}
                          size="sm"
                          tokens={eliminated ? undefined : m.session_tokens}
                          online={!eliminated}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-white">@{name}</p>
                          <p className="text-[9px] text-phantom-muted">
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
                    <li className="text-[10px] text-phantom-muted">Solo — no squad</li>
                  )}
                </ul>
              </div>

              {/* Top Squads */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-phantom-muted mb-2">
                  TOP SQUADS
                </p>
                <ul className="space-y-2">
                  {topSquads.slice(0, 4).map((squad, index) => (
                    <li
                      key={squad.id}
                      className="flex items-center justify-between glass rounded-lg px-2 py-2 border border-phantom-border/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-phantom-muted">{index + 1}</span>
                        <div>
                          <p className="text-[10px] font-semibold text-white">{squad.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-500">{Number(squad.squad_tokens).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                {topSquads.length > 4 && (
                  <button className="w-full text-center text-[10px] text-purple-400 hover:text-purple-300 mt-2">
                    +{topSquads.length - 4} More
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM: Shadow Surge Meter & other controls */}
        <footer className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 sm:pt-2">
          <div className="flex items-center justify-between">
            {/* Shadow Surge Meter */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-20 sm:w-28 h-1 bg-phantom-border/50 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: "72%" }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] sm:text-[9px] text-purple-400 font-semibold uppercase">Shadow Surge</span>
                <span className="text-[6px] sm:text-[8px] text-phantom-muted">72%</span>
              </div>
            </div>

            {/* Bottom Hide Handle indicator - Hide on small mobile */}
            <div className="hidden sm:flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
                <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
                <div className="w-1 h-1 rounded-full bg-phantom-muted/40" />
              </div>
              <p className="text-[7px] text-phantom-muted/60 uppercase">Bottom navigation hidden</p>
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 glass rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-red-900/50 bg-red-900/10">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] text-red-400 font-semibold uppercase">REC</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
