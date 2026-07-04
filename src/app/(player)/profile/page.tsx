"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { AVATARS } from "@/types/gameplay";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
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
  ChevronRight
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
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-phantom-surface">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-phantom-purple w-6 h-6">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">PROFILE</h1>
            <p className="text-sm text-phantom-muted">Who am I becoming?</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-phantom-surface">
            <Upload className="w-5 h-5 text-phantom-muted" />
          </button>
          <button className="p-2 rounded-full bg-phantom-surface">
            <Settings className="w-5 h-5 text-phantom-muted" />
          </button>
          <button className="relative p-2 rounded-full bg-phantom-surface">
            <Bell className="w-5 h-5 text-phantom-muted" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-phantom-purple rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500 text-xl">💲</span>
            <span className="text-sm text-phantom-muted uppercase">Wallet Balance</span>
            <span className="ml-auto text-xs bg-phantom-surface px-2 py-1 rounded text-phantom-muted">USD</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">
            ${((profile.wallet_balance_cents ? (profile.wallet_balance_cents as number) / 100 : 25.00).toFixed(2))}
          </p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-phantom-purple">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </Card>
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-phantom-purple text-xl">💎</span>
            <span className="text-sm text-phantom-muted uppercase">Phantom Tokens</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">250</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-phantom-purple">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </Card>
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-xl">🔶</span>
            <span className="text-sm text-phantom-muted uppercase">Squad Tokens</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">1,340</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-phantom-purple">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-36 h-40 rounded-2xl border-4 border-phantom-purple overflow-hidden bg-gradient-to-br from-phantom-purple/20 to-phantom-surface flex items-center justify-center">
              <span className="text-8xl">{avatar?.emoji ?? "🌑"}</span>
            </div>
            <button className="absolute bottom-2 right-2 bg-phantom-purple p-1.5 rounded-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-display font-bold text-white">
                {(profile.username as string) || "PhantomX"}
              </h2>
              <span className="text-phantom-purple text-xl">✓</span>
            </div>
            <p className="text-lg text-phantom-muted">Shadow Elite</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="purple" className="text-xs font-bold">
                18
              </Badge>
              <p className="text-sm text-phantom-muted">
                • 2,450 / 3,000 XP
              </p>
            </div>
            <p className="text-xs text-phantom-muted mt-3">
              ID: PHX-87452 • Member since: 23 Apr 2024
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="purple" className="text-xs">
                🌙 Eclipse Camp
              </Badge>
              <Badge variant="purple" className="text-xs">
                🌙 Eclipse Squad
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-phantom-muted uppercase">Global Rank</p>
            <p className="text-2xl font-display font-bold text-white">#2,842</p>
            <p className="text-xs text-phantom-muted mt-1">
              Top 3.12% of all players
            </p>
            <p className="text-xs text-phantom-muted uppercase mt-4">
              Highest Session Rank
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-xl">⚙️</span>
              <p className="text-2xl font-display font-bold text-white">#27</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["overview", "stats", "history", "achievements", "rivals", "badges"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
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
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                Personal Stats
              </h3>
              <div className="flex gap-1 bg-phantom-surface px-2 py-1 rounded-lg">
                <button className="text-xs text-phantom-purple font-semibold">
                  This Season
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-phantom-muted uppercase">Wins</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 12 15.3 15.3 0 0 1 8 20" />
                    <path d="M22 12a15.3 15.3 0 0 1-4 8" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">38</p>
                <p className="text-xs text-phantom-muted uppercase">Top 5 Finishes</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Skull className="w-6 h-6 text-phantom-muted" />
                </div>
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-xs text-phantom-muted uppercase">Sessions Played</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">18</p>
                <p className="text-xs text-phantom-muted uppercase">Revives</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Swords className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-white">56</p>
                <p className="text-xs text-phantom-muted uppercase">Steals</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">72%</p>
                <p className="text-xs text-phantom-muted uppercase">Steal Success</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-phantom-muted uppercase">Championships</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H21" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">$2,450</p>
                <p className="text-xs text-phantom-muted uppercase">Total Earned</p>
              </Card>
              <Card className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">72%</p>
                <p className="text-xs text-phantom-muted uppercase">Win Rate</p>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted mb-3">
                Progression Path
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                      <svg className="w-6 h-6 text-phantom-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </div>
                    <div className="h-1 flex-1 bg-phantom-purple/30"></div>
                    <div className="w-20 h-20 rounded-full bg-phantom-surface border-2 border-phantom-purple flex items-center justify-center">
                      <span className="text-4xl">{avatar?.emoji ?? "🌑"}</span>
                    </div>
                    <div className="h-1 flex-1 bg-phantom-border"></div>
                    <div className="w-12 h-12 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                      <svg className="w-6 h-6 text-phantom-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <rect x="9" y="9" width="6" height="6" />
                      </svg>
                    </div>
                    <div className="h-1 flex-1 bg-phantom-border"></div>
                    <div className="w-12 h-12 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                      <svg className="w-6 h-6 text-phantom-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <rect x="9" y="9" width="6" height="6" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-phantom-muted">Shadow Initiate</p>
                    <p className="text-xs text-phantom-muted">Shadow Elite</p>
                    <p className="text-xs text-phantom-muted">Phantom Lord</p>
                    <p className="text-xs text-phantom-muted">Phantom Legend</p>
                  </div>
                </div>
              </div>
              <Card className="p-4">
                <p className="text-xs text-phantom-muted uppercase">Next Milestone</p>
                <p className="text-sm font-semibold text-white mt-1">
                  Level 20 Reward
                </p>
                <p className="text-xs text-phantom-muted mt-1">
                  Elite Avatar Frame
                </p>
                <div className="mt-3">
                  <p className="text-xs text-phantom-muted">
                  2,450 / 3,000 XP
                  </p>
                  <div className="h-2 w-full bg-phantom-border rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-phantom-purple" style={{ width: "82%" }}></div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-40 h-40">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Recent Sessions
                </h3>
                <Link href="/profile/sessions" className="text-xs text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2">
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
                  <Card key={i} className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=400&auto=format&fit=crop"
                        alt={session.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {session.name}
                      </p>
                      <p className="text-xs text-phantom-muted">
                        {session.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-phantom-muted uppercase">
                        Rank
                      </p>
                      <p className="text-sm font-bold text-purple-500">
                        {session.rank}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-phantom-muted uppercase">
                        Tokens
                      </p>
                      <p className="text-sm font-bold text-white">
                        {session.tokens}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-phantom-muted uppercase">
                        Won
                      </p>
                      <p className="text-sm font-bold text-green-500">
                        {session.won}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Badges
                </h3>
                <Link href="#" className="text-xs text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { name: "Session Killer", icon: "💀", unlocked: true },
                  { name: "Reviver", icon: "⭐", unlocked: true },
                  { name: "Master Thief", icon: "👑", unlocked: true },
                  { name: "Champion", icon: "🏆", unlocked: true }
                ].map((badge, i) => (
                  <Card key={i} className="p-2 text-center">
                    <div className="text-3xl mb-1">
                      {badge.icon}
                    </div>
                    <p className="text-[8px] text-phantom-muted uppercase leading-tight">
                      {badge.name}
                    </p>
                    <p className="text-[8px] text-phantom-muted">
                      Unlocked
                    </p>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                  Rivalries
                </h3>
                <Link href="#" className="text-xs text-phantom-purple flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {[
                  { name: "DarkRider", camp: "Nightfall Camp", level: "High" },
                  { name: "StealthX", camp: "ShadowX", level: "Medium" },
                  { name: "BloodHawk", camp: "Eclipse Camp", level: "Low" }
                ].map((rival, i) => (
                  <Card key={i} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-lg">
                      ⚔️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {rival.name}
                      </p>
                      <p className="text-xs text-phantom-muted">
                        {rival.camp}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-phantom-muted uppercase">
                        Rivalry Level
                      </p>
                      <p className={cn(
                        "text-sm font-bold",
                        rival.level === "High" ? "text-red-500" :
                        rival.level === "Medium" ? "text-yellow-500" : "text-green-500"
                      )}>
                        {rival.level}
                      </p>
                    </div>
                    <button className="p-1.5 bg-phantom-surface rounded-full">
                      <Swords className="w-4 h-4 text-phantom-muted" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
                    Session Streak
                  </p>
                  <p className="text-2xl font-bold text-white">7</p>
                  <p className="text-xs text-phantom-muted">
                    Best: 12
                  </p>
                </div>
              </div>
            </Card>
            <div className="space-y-2">
              <p className="text-xs text-phantom-muted uppercase">Next Streak Reward</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💜</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    100 Phantom Tokens
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-phantom-border rounded-full overflow-hidden">
                      <div className="h-full bg-phantom-purple" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-xs text-phantom-muted">
                      7 / 10 DAYS
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                      i < 7 ? "bg-phantom-purple/20 border border-phantom-purple" :
                      i === 7 ? "bg-phantom-purple text-white" :
                      "bg-phantom-surface border border-phantom-border"
                    )}
                  >
                    {i < 8 ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-phantom-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-phantom-bg border-t border-phantom-border py-3 px-4">
        <div className="flex justify-around">
          <Link href="/home" className="flex flex-col items-center gap-1 text-phantom-muted">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] uppercase">Home</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center gap-1 text-phantom-muted">
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] uppercase">Sessions</span>
          </Link>
          <Link href="/" className="flex flex-col items-center gap-1 text-phantom-muted">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[10px] uppercase">World</span>
          </Link>
          <Link href="/squads" className="flex flex-col items-center gap-1 text-phantom-muted">
            <Users className="w-6 h-6" />
            <span className="text-[10px] uppercase">Squad</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-phantom-purple">
            <div className="w-10 h-10 rounded-full bg-phantom-purple/20 flex items-center justify-center -mt-5 border-t border-phantom-purple">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-[10px] uppercase text-phantom-purple">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
