"use client";

import { useState, useEffect } from "react";
import { PremiumSpinWheel, ButtonAnimator } from "@/components/gameplay/premium-wheel";
import { StealTargetPicker } from "@/components/gameplay/StealTargetPicker";
import { FireBoostMeter } from "@/components/gameplay/FireBoostMeter";
import { RevivePanel } from "@/components/gameplay/RevivePanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";
import type { SpinOutcome, StealTarget } from "@/types/gameplay";
import { AnimatedAvatar } from "@/components/avatar";
import type { ProfileSpriteState } from "@/lib/assets/types";
import {
  Zap,
  Shield,
  UserMinus,
  Umbrella,
  Mic,
  Users,
  Crown,
  RefreshCw,
  Plus,
  Package,
  Trophy,
  ChevronRight,
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

const skills = [
  { id: "steal", name: "STEAL BOOST", icon: <Zap className="w-6 h-6" />, color: "text-purple-400", bg: "from-purple-700 to-purple-900", border: "border-purple-500/70", ready: true, cooldown: null },
  { id: "shield", name: "SHIELD", icon: <Shield className="w-6 h-6" />, color: "text-blue-400", bg: "from-blue-700 to-blue-900", border: "border-blue-500/70", ready: true, cooldown: null },
  { id: "cloak", name: "CLOAK", icon: <UserMinus className="w-6 h-6" />, color: "text-purple-300", bg: "from-purple-800 to-gray-900", border: "border-purple-400/70", ready: false, cooldown: "12s" },
  { id: "multiplier", name: "2x", icon: <span className="font-black">2x</span>, color: "text-purple-300", bg: "from-purple-700 to-blue-800", border: "border-purple-400/70", ready: true, cooldown: null },
  { id: "insurance", name: "INSURANCE", icon: <Umbrella className="w-6 h-6" />, color: "text-yellow-400", bg: "from-yellow-700 to-yellow-900", border: "border-yellow-500/70", ready: true, cooldown: null },
  { id: "revive", name: "REVIVE", icon: <Plus className="w-6 h-6" />, color: "text-green-400", bg: "from-green-700 to-green-900", border: "border-green-500/70", ready: true, cooldown: null },
  { id: "more", name: "MORE", icon: <Package className="w-6 h-6" />, color: "text-gray-400", bg: "from-gray-700 to-gray-900", border: "border-gray-500/50", ready: false, cooldown: null },
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
  const [showSquad, setShowSquad] = useState(true);
  const [spinCount, setSpinCount] = useState(3);
  const [liveFeedEvents, setLiveFeedEvents] = useState<LiveFeedEvent[]>([
    { id: 1, event_type: "advance", message: "NovaQueen 👻 stole from Ghost", created_at: "10s ago" },
    { id: 2, event_type: "camp", message: "Camp Eclipse 🌑 took the lead", created_at: "28s ago" },
    { id: 3, event_type: "revive", message: "PhantomX ➕ revived Nightfall", created_at: "38s ago" },
  ]);
  const [topSquads, setTopSquads] = useState<Squad[]>([
    { id: "1", name: "ShadowKings", squad_tokens: 1500 },
    { id: "2", name: "NightHunters", squad_tokens: 1350 },
    { id: "3", name: "Eclipse 🌑", squad_tokens: 1200 },
  ]);

  const highestTokens = Math.max(...leaderboard.map((p) => p.session_tokens), 0);
  const mockLeaderboard = [
    { rank: 1, name: "ShadowKing 👑", tokens: 182 },
    { rank: 2, name: "NovaHunter", tokens: 168 },
    { rank: 3, name: "Eclipse 🌑", tokens: 154 },
    { rank: 4, name: "PhantomX", tokens: 142 },
    { rank: 5, name: "Ghost", tokens: 131 },
  ];

  return (
    <div className="min-h-screen bg-[#080512] relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {/* Radial gradient center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)]" />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top HUD */}
        <header className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
          {/* Prize Pool */}
          <div className="glass rounded-2xl border border-purple-600/40 px-4 py-3 bg-gradient-to-br from-purple-950/70 to-purple-900/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-xs font-black">$</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-green-300/80 font-semibold">PRIZE POOL</span>
                <span className="text-xl font-mono font-black text-white">
                  ${totalPoolCents ? (totalPoolCents / 100).toLocaleString() : "12,500"}
                </span>
              </div>
            </div>
          </div>

          {/* Phase & Timer */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-sm font-bold text-purple-400">PHASE {phase}/{6}</span>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            </div>
            <span className="text-3xl font-mono font-black text-white tracking-wider">
              {phaseEndsAt ? formatPhaseTimer(remaining) : "02:45"}
            </span>
          </div>

          {/* Rank & Alive */}
          <div className="flex items-center gap-3 glass rounded-2xl border border-purple-600/40 px-4 py-3 bg-gradient-to-br from-purple-950/70 to-purple-900/30">
            <div className="flex flex-col items-center">
              <Users className="w-5 h-5 text-purple-300" />
              <span className="text-[10px] uppercase tracking-wider text-purple-400/80 font-semibold">ALIVE</span>
              <span className="text-xl font-mono font-black text-white">{totalPlayers || 28}</span>
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-purple-600/30 via-purple-400/60 to-purple-600/30" />
            <div className="flex flex-col items-center">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-[10px] uppercase tracking-wider text-yellow-400/80 font-semibold">YOUR RANK</span>
              <span className="text-xl font-mono font-black text-yellow-300">{playerRank ? `${playerRank}th` : "7th"}</span>
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-purple-600/30 via-purple-400/60 to-purple-600/30" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-purple-400/80 font-semibold">TOKENS</span>
              <span className="text-xl font-mono font-black text-white">{tokens || 142}</span>
            </div>
          </div>
        </header>

        {/* Shadow Surge Meter */}
        <div className="px-4 pb-3">
          <div className="glass rounded-full border border-purple-600/40 px-4 py-2 bg-gradient-to-br from-purple-950/60 to-purple-900/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center border border-purple-500/60">
              <Zap className="w-5 h-5 text-purple-300" />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-3 bg-purple-900/50 rounded-full overflow-hidden border border-purple-600/30">
                <div className="h-full w-[72%] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.7)]" />
              </div>
              <span className="font-mono text-sm font-bold text-purple-400">72%</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 pb-4">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Live Feed */}
            <div className="w-full lg:w-64 order-2 lg:order-1">
              <div className="glass rounded-2xl border border-purple-600/40 bg-gradient-to-br from-purple-950/70 to-purple-900/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-green-400">LIVE FEED</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {liveFeedEvents.map((event, i) => (
                    <div key={i} className="glass rounded-xl border border-purple-600/30 bg-purple-950/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-purple-950 flex items-center justify-center text-lg">
                          👻
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{event.message}</p>
                          <p className="text-[10px] text-purple-400/70">{event.created_at}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-purple-400/60 font-medium">LIVE FEED PEEK</p>
                <p className="text-[9px] text-purple-400/40">
                  Shows the latest three activities in real-time. Auto-updates, new items enter from the bottom.
                </p>
              </div>
              
              {/* Voice Widget */}
              <div className="mt-4 glass rounded-full border border-green-600/40 bg-gradient-to-br from-green-950/60 to-green-900/30 p-3 flex items-center justify-center">
                <div className="text-center">
                  <Mic className="w-8 h-8 text-green-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-[10px] text-green-300 font-medium">ACTIVE</span>
                </div>
              </div>
              <p className="mt-2 text-[9px] text-purple-400/50 text-center">
                VOICE WIDGET
              </p>
            </div>

            {/* Center: Wheel */}
            <div className="flex-1 flex flex-col items-center order-1 lg:order-2">
              {/* Spin Wheel */}
              <div className="mb-4">
                <PremiumSpinWheel
                  isSpinning={isSpinning}
                  outcome={lastOutcome}
                  onSpinComplete={onSpinComplete}
                />
              </div>

              {/* Spin Button */}
              <div className="mb-4 -mt-2">
                <ButtonAnimator
                  state={isEliminated ? "idle" : isSpinning ? "cooldown" : spinLocked ? "cooldown" : "idle"}
                  disabled={isSpinning || spinLocked || isEliminated}
                  onClick={onSpin}
                />
              </div>

              {/* Active Effects */}
              <div className="glass rounded-xl border border-purple-600/40 bg-gradient-to-br from-purple-950/60 to-purple-900/20 p-3 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">ACTIVE EFFECTS</span>
                <div className="flex items-center gap-2">
                  {[
                    { icon: <Shield className="w-4 h-4 text-blue-400" />, cooldown: "12s" },
                    { icon: <Zap className="w-4 h-4 text-purple-400" />, cooldown: "8s" },
                    { icon: <Crown className="w-4 h-4 text-yellow-400" />, cooldown: "15s" },
                  ].map((effect, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl glass border border-purple-600/40 bg-purple-950/40 flex flex-col items-center justify-center">
                      {effect.icon}
                      <span className="text-[8px] text-purple-400 font-mono">{effect.cooldown}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Squad & Leaderboard */}
            <div className="w-full lg:w-72 order-3">
              {/* Prepare Handle */}
              <div className="glass rounded-2xl border border-yellow-600/40 bg-gradient-to-br from-yellow-950/60 to-yellow-900/20 p-4 mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-700 to-yellow-900 flex items-center justify-center border border-yellow-500/60">
                  <Package className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-yellow-300 uppercase tracking-wider">PREPARE HANDLE</p>
                  <p className="text-[10px] text-yellow-400/70">Tap to open the prepare / inventory drawer.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-500/60" />
              </div>

              {/* Squad Handle */}
              <div className="glass rounded-2xl border border-purple-600/40 bg-gradient-to-br from-purple-950/60 to-purple-900/20 p-4 mb-4">
                <button
                  onClick={() => setShowSquad(!showSquad)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center border border-purple-500/60">
                      <Users className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">SQUAD HANDLE</p>
                      <p className="text-[10px] text-purple-400/70">Tap to open the squad panel.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-500/60" />
                </button>
              </div>

              {/* Top Players */}
              <div className="glass rounded-2xl border border-purple-600/40 bg-gradient-to-br from-purple-950/60 to-purple-900/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-300">TOP PLAYERS</span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  {mockLeaderboard.map((player, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2 rounded-xl ${
                        i === 0 ? "glass border border-yellow-500/40 bg-yellow-950/30" : "glass border border-purple-600/30 bg-purple-950/20"
                      }`}
                    >
                      <span className="font-mono text-sm font-bold text-purple-400 w-6">{player.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center border border-purple-500/50 text-lg">
                        {i === 0 ? "👑" : "👻"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{player.name}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-purple-300">{player.tokens}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 text-[10px] font-semibold text-purple-400 uppercase tracking-wider hover:text-purple-300 transition-colors">
                  VIEW FULL LEADERBOARD
                </button>
                <p className="mt-2 text-[9px] text-purple-400/50">TOP PLAYERS</p>
                <p className="text-[9px] text-purple-400/40">Top 5 players in this session based on Session Tokens. Leaderboard updates real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Skill Dock */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-7 gap-2">
            {skills.map((skill, i) => (
              <div key={skill.id} className="flex flex-col items-center gap-1">
                <button
                  className={`w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center bg-gradient-to-br ${skill.bg} ${skill.border} ${
                    skill.ready ? "hover:scale-105 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "opacity-40 cursor-not-allowed"
                  }`}
                  disabled={!skill.ready}
                >
                  <div className="text-lg">{skill.icon}</div>
                  {skill.cooldown && (
                    <span className="text-[9px] text-gray-400 font-mono mt-1">{skill.cooldown}</span>
                  )}
                </button>
                <span className="text-[8px] text-purple-400/70 font-semibold uppercase text-center leading-tight">{skill.name}</span>
              </div>
            ))}
          </div>

          {/* Skill Descriptions */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-7 gap-2">
            {skills.slice(0, 6).map((skill, i) => (
              <div key={skill.id} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: i === 0 ? "var(--color-purple-500)" : i === 1 ? "var(--color-blue-500)" : i === 2 ? "var(--color-purple-400)" : i === 3 ? "var(--color-purple-500)" : i === 4 ? "var(--color-yellow-500)" : "var(--color-green-500)" }} />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">{skill.name}</span>
                  <p className="text-[8px] text-purple-400/60">
                    {skill.id === "steal" && "Increases steal success chance for or amount."}
                    {skill.id === "shield" && "Blocks incoming steal for a limited time."}
                    {skill.id === "cloak" && "Makes you harder to target for a limited time."}
                    {skill.id === "multiplier" && "Increases token gains for a limited time."}
                    {skill.id === "insurance" && "Protects a portion of your tokens if stolen."}
                    {skill.id === "revive" && "Allows you to revive a squad teammate."}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1 bg-gray-500" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase">MORE SKILLS</span>
                <p className="text-[8px] text-purple-400/60">Access additional skills you own.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
