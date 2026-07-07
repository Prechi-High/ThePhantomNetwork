"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { AVATARS } from "@/types/gameplay";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { GameplayLayoutSettings } from "@/components/gameplay/GameplayLayoutSettings";

import {
  Trophy,
  Skull,
  Crown,
  Swords,
  Users,
  Calendar,
  Bell,
  Settings,
  Upload,
  ChevronRight,
  ChevronLeft,
  Plus,
  Clock,
  Globe,
  Check,
  Square,
  TrendingUp
} from "lucide-react";
import Image from "next/image";

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = () => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetch("/api/profile", { credentials: "same-origin" })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load profile");
          return r.json();
        })
        .then((d) => {
          setProfile(d.profile);
        }),
      fetch("/api/wallet", { credentials: "same-origin" })
        .then((r) => r.json())
        .then((d) => setTransactions(d.transactions ?? []))
    ])
    .catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-phantom-muted text-xl">Loading...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-phantom-danger text-xl">{error}</p>
    </div>
  );
  
  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-phantom-muted text-xl">Profile not found</p>
    </div>
  );

  const avatar = AVATARS.find((a) => a.id === profile.avatar_id);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-3 rounded-full hover:bg-phantom-surface transition-colors">
            <ChevronLeft className="w-6 h-6 text-phantom-purple" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">PROFILE</h1>
            <p className="text-sm text-phantom-muted">Who am I becoming?</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button className="p-3 rounded-full bg-phantom-surface hover:bg-phantom-surface/80 transition-colors">
            <Upload className="w-5 h-5 text-phantom-muted" />
          </button>
          <button className="p-3 rounded-full bg-phantom-surface hover:bg-phantom-surface/80 transition-colors">
            <Settings className="w-5 h-5 text-phantom-muted" />
          </button>
          <button className="relative p-3 rounded-full bg-phantom-surface hover:bg-phantom-surface/80 transition-colors">
            <Bell className="w-5 h-5 text-phantom-muted" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-phantom-purple rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500 text-2xl">💲</span>
            <span className="text-sm text-phantom-muted uppercase">Wallet Balance</span>
            <span className="ml-auto text-xs bg-phantom-surface px-2 py-1 rounded text-phantom-muted">USD</span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">
            ${((profile.wallet_balance_cents ? (profile.wallet_balance_cents as number) / 100 : 25.00).toFixed(2))}
          </p>
          <button className="absolute top-5 right-5 p-3 bg-phantom-purple/20 rounded-lg hover:bg-phantom-purple/30 transition-colors">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-phantom-purple text-2xl">💎</span>
            <span className="text-sm text-phantom-muted uppercase">Phantom Tokens</span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">250</p>
          <button className="absolute top-5 right-5 p-3 bg-phantom-purple/20 rounded-lg hover:bg-phantom-purple/30 transition-colors">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-5 relative sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500 text-2xl">🔶</span>
            <span className="text-sm text-phantom-muted uppercase">Squad Tokens</span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">1,340</p>
          <button className="absolute top-5 right-5 p-3 bg-phantom-purple/20 rounded-lg hover:bg-phantom-purple/30 transition-colors">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="relative mx-auto lg:mx-0">
            <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-2xl border-4 border-phantom-purple overflow-hidden bg-gradient-to-br from-phantom-purple/20 to-phantom-surface flex items-center justify-center">
              <span className="text-8xl sm:text-9xl">{avatar?.emoji ?? "🌑"}</span>
            </div>
            <button className="absolute bottom-3 right-3 bg-phantom-purple p-2 rounded-full hover:bg-phantom-purple/90 transition-colors">
              <Upload className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {(profile.username as string) || "PhantomX"}
              </h2>
              <span className="text-phantom-purple text-2xl">✓</span>
            </div>
            <p className="text-lg sm:text-xl text-phantom-muted">Shadow Elite</p>
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 flex-wrap">
              <Badge variant="purple" className="text-sm font-bold px-3 py-1">
                18
              </Badge>
              <p className="text-sm text-phantom-muted">
                • 2,450 / 3,000 XP
              </p>
            </div>
            <p className="text-xs sm:text-sm text-phantom-muted mt-4">
              ID: PHX-87452 • Member since: 23 Apr 2024
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 flex-wrap">
              <Badge variant="purple" className="text-xs px-3 py-1">
                🌙 Eclipse Camp
              </Badge>
              <Badge variant="purple" className="text-xs px-3 py-1">
                🌙 Eclipse Squad
              </Badge>
            </div>
          </div>
          <div className="text-center lg:text-right w-full lg:w-auto">
            <p className="text-xs text-phantom-muted uppercase">Global Rank</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-white">#2,842</p>
            <p className="text-xs sm:text-sm text-phantom-muted mt-1">
              Top 3.12% of all players
            </p>
            <p className="text-xs text-phantom-muted uppercase mt-6">
              Highest Session Rank
            </p>
            <div className="flex items-center justify-center lg:justify-end gap-2 mt-2">
              <span className="text-2xl">⚙️</span>
              <p className="text-3xl sm:text-4xl font-display font-bold text-white">#27</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {["overview", "stats", "history", "achievements", "rivals", "badges"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
            "px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-base font-semibold whitespace-nowrap transition-all flex-shrink-0",
            activeTab === tab
              ? "bg-phantom-purple/20 text-phantom-purple border-b-2 border-phantom-purple"
              : "text-phantom-muted hover:text-white"
          )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                Gameplay Layout
              </h3>
            </div>
            <GameplayLayoutSettings />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                Personal Stats
              </h3>
              <div className="flex gap-1 bg-phantom-surface px-3 py-2 rounded-lg">
                <button className="text-xs text-phantom-purple font-semibold">
                  This Season
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-white">24</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Wins</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Globe className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white">38</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Top 5 Finishes</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Skull className="w-8 h-8 text-phantom-muted" />
                </div>
                <p className="text-3xl font-bold text-white">156</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Sessions Played</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-white">18</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Revives</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Swords className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-white">56</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Steals</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Swords className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-white">72%</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Steal Success</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Crown className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Championships</p>
              </Card>
              <Card className="p-5 text-center">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-white">$2,450</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Total Earned</p>
              </Card>
              <Card className="p-5 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center mb-3">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-white">72%</p>
                <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Win Rate</p>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted mb-4">
                Progression Path
              </h3>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-phantom-muted" />
                  </div>
                    <div className="h-1 flex-1 bg-phantom-purple/30"></div>
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-phantom-surface border-2 border-phantom-purple flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl sm:text-5xl">{avatar?.emoji ?? "🌑"}</span>
                    </div>
                    <div className="h-1 flex-1 bg-phantom-border"></div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center flex-shrink-0">
                      <Square className="w-6 h-6 sm:w-8 sm:h-8 text-phantom-muted" />
                    </div>
                    <div className="h-1 flex-1 bg-phantom-border"></div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center flex-shrink-0">
                      <Square className="w-6 h-6 sm:w-8 sm:h-8 text-phantom-muted" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-center">
                    <p className="text-[10px] sm:text-xs text-phantom-muted flex-1">Shadow Initiate</p>
                    <p className="text-[10px] sm:text-xs text-phantom-muted flex-1">Shadow Elite</p>
                    <p className="text-[10px] sm:text-xs text-phantom-muted flex-1">Phantom Lord</p>
                    <p className="text-[10px] sm:text-xs text-phantom-muted flex-1">Phantom Legend</p>
                  </div>
                </div>
              </div>
              <Card className="p-5">
                <p className="text-xs sm:text-sm text-phantom-muted uppercase">Next Milestone</p>
                <p className="text-base sm:text-lg font-semibold text-white mt-2">
                  Level 20 Reward
                </p>
                <p className="text-xs sm:text-sm text-phantom-muted mt-1">
                  Elite Avatar Frame
                </p>
                <div className="mt-4">
                  <p className="text-xs sm:text-sm text-phantom-muted">
                    2,450 / 3,000 XP
                  </p>
                  <div className="h-2 sm:h-3 w-full bg-phantom-border rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-phantom-purple" style={{ width: "82%" }}></div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="10" width="80" height="80" rx="20" fill="none" stroke="url(#frameGrad)" strokeWidth="3" />
                  <rect x="15" y="15" width="70" height="70" rx="15" fill="none" stroke="url(#frameGrad)" strokeWidth="2" />
                  <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="url(#frameGrad)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Recent Sessions
                </h3>
                <Link href="/profile/sessions" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "Nightfall Arena",
                    time: "2h ago",
                    rank: "#4",
                    tokens: 42,
                    won: "$185"
                  },
                  {
                    name: "Phantom Pit",
                    time: "3h ago",
                    rank: "#12",
                    tokens: 28,
                    won: "$75"
                  },
                  {
                    name: "Void Citadel",
                    time: "1d ago",
                    rank: "#2",
                    tokens: 56,
                    won: "$320"
                  },
                  {
                    name: "Nightfall Arena",
                    time: "2d ago",
                    rank: "#8",
                    tokens: 33,
                    won: "$110"
                  }
                ].map((session, i) => (
                  <Card key={i} className="p-4 flex flex-wrap items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=400&auto=format&fit=crop"
                        alt={session.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {session.name}
                      </p>
                      <p className="text-xs sm:text-sm text-phantom-muted">
                        {session.time}
                      </p>
                    </div>
                    <div className="text-right flex-1 min-w-[80px]">
                      <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                        Rank
                      </p>
                      <p className="text-sm sm:text-base font-bold text-purple-500">
                        {session.rank}
                      </p>
                    </div>
                    <div className="text-right flex-1 min-w-[80px]">
                      <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                        Tokens
                      </p>
                      <p className="text-sm sm:text-base font-bold text-white">
                        {session.tokens}
                      </p>
                    </div>
                    <div className="text-right flex-1 min-w-[80px]">
                      <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                        Won
                      </p>
                      <p className="text-sm sm:text-base font-bold text-green-500">
                        {session.won}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Badges
                </h3>
                <Link href="#" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { name: "Session Killer", icon: "💀", unlocked: true },
                  { name: "Reviver", icon: "⭐", unlocked: true },
                  { name: "Master Thief", icon: "👑", unlocked: true },
                  { name: "Champion", icon: "🏆", unlocked: true }
                ].map((badge, i) => (
                  <Card key={i} className="p-4 text-center">
                    <div className="text-4xl mb-2">
                      {badge.icon}
                    </div>
                    <p className="text-[10px] sm:text-xs text-phantom-muted uppercase leading-tight">
                      {badge.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-phantom-muted mt-1">
                      Unlocked
                    </p>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Rivalries
                </h3>
                <Link href="#" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: "DarkRider", camp: "Nightfall Camp", level: "High" },
                  { name: "StealthX", camp: "ShadowX", level: "Medium" },
                  { name: "BloodHawk", camp: "Eclipse Camp", level: "Low" }
                ].map((rival, i) => (
                  <Card key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-xl flex-shrink-0">
                      ⚔️
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {rival.name}
                      </p>
                      <p className="text-xs sm:text-sm text-phantom-muted">
                        {rival.camp}
                      </p>
                    </div>
                    <div className="text-right flex-1 min-w-[100px]">
                      <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                        Rivalry Level
                      </p>
                      <p className={cn(
                        "text-sm sm:text-base font-bold",
                        rival.level === "High" ? "text-red-500" :
                        rival.level === "Medium" ? "text-yellow-500" : "text-green-500"
                      )}>
                        {rival.level}
                      </p>
                    </div>
                    <button className="p-2.5 bg-phantom-surface rounded-full hover:bg-phantom-surface/80 transition-colors flex-shrink-0">
                      <Swords className="w-5 h-5 text-phantom-muted" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                    Session Streak
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-white mt-1">7</p>
                  <p className="text-xs sm:text-sm text-phantom-muted mt-1">
                    Best: 12
                  </p>
                </div>
              </div>
            </Card>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-phantom-muted uppercase">Next Streak Reward</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">💜</span>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-white">
                    100 Phantom Tokens
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 sm:h-3 bg-phantom-border rounded-full overflow-hidden">
                      <div className="h-full bg-phantom-purple" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-xs sm:text-sm text-phantom-muted whitespace-nowrap">
                      7 / 10 DAYS
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap justify-center lg:justify-start">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg",
                      i < 7 ? "bg-phantom-purple/20 border border-phantom-purple" :
                      i === 7 ? "bg-phantom-purple text-white" :
                      "bg-phantom-surface border border-phantom-border"
                    )}
                  >
                    {i < 8 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-phantom-muted" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
