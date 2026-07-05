"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  UserPlus,
  Users,
  PlayCircle,
  Filter,
  Plus,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { AVATARS } from "@/types/gameplay";

function HowItWorksStep({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 flex-1">
      <div className="w-14 h-14 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-phantom-purple">
        {icon}
      </div>
      <div>
        <p className="font-bold text-base">{title}</p>
        <p className="text-xs text-phantom-muted leading-tight mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [squads, setSquads] = useState<Record<string, unknown>[]>([]);
  const [players, setPlayers] = useState<Record<string, unknown>[]>([]);
  const [activeTab, setActiveTab] = useState("recommended");

  useEffect(() => {
    fetch("/api/squads/leaderboard")
      .then((r) => r.json())
      .then((d) => setSquads(d.squads ?? []));
  }, []);

  const tabs = ["recommended", "top ranked", "most active", "new squads"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-3 rounded-full hover:bg-phantom-surface">
            <ChevronLeft className="w-7 h-7 text-phantom-muted" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-phantom-purple">COMMUNITY</h1>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">FIND YOUR SQUAD</h2>
            <p className="text-sm md:text-base text-phantom-muted mt-2">
              You don&apos;t have a permanent squad yet. Find teammates. Win together. Build something legendary.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:w-auto">
          <Button variant="secondary" className="flex-1 md:flex-none px-6 py-4">
            <UserPlus className="w-6 h-6" />
            <span className="ml-3">INVITE FRIENDS</span>
          </Button>
          <Button className="flex-1 md:flex-none px-6 py-4 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900">
            <Users className="w-6 h-6" />
            <span className="ml-3">CREATE SQUAD</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-green-500 text-2xl">💲</span>
            <span className="text-sm md:text-base text-phantom-muted uppercase">Wallet Balance</span>
            <span className="ml-auto text-xs bg-phantom-surface px-3 py-1.5 rounded text-phantom-muted">USD</span>
          </div>
          <p className="text-4xl font-mono font-bold text-white">$25.00</p>
          <button className="absolute top-6 right-6 p-3 bg-phantom-purple/20 rounded-xl">
            <Plus className="w-6 h-6 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-6 relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-phantom-purple text-2xl">💎</span>
            <span className="text-sm md:text-base text-phantom-muted uppercase">Phantom Tokens</span>
          </div>
          <p className="text-4xl font-mono font-bold text-white">250</p>
          <button className="absolute top-6 right-6 p-3 bg-phantom-purple/20 rounded-xl">
            <Plus className="w-6 h-6 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-6 relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-yellow-500 text-2xl">🔶</span>
            <span className="text-sm md:text-base text-phantom-muted uppercase">Squad Tokens</span>
          </div>
          <p className="text-4xl font-mono font-bold text-white">0</p>
          <p className="text-xs text-phantom-muted mt-2">Earn after your first completed session</p>
          <button className="absolute top-6 right-6 p-3 bg-phantom-purple/20 rounded-xl">
            <Plus className="w-6 h-6 text-phantom-purple" />
          </button>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-green-500 animate-pulse w-4 h-4">●</span>
          <span className="text-sm md:text-base font-semibold text-white">1,342 PLAYERS ONLINE</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-phantom-muted text-sm md:text-base">286 SQUADS ACTIVE</span>
          <span className="text-phantom-muted text-sm md:text-base">24 SESSIONS TODAY</span>
          <span className="text-phantom-muted text-sm md:text-base">32 NEW SQUADS TODAY</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">HOW SQUADS WORK</p>
        <Card className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <HowItWorksStep
              icon={<PlayCircle className="w-7 h-7" />}
              title="Play a Session"
              desc="You'll be paired with teammates."
            />
            <HowItWorksStep
              icon={<Users className="w-7 h-7" />}
              title="Perform Together"
              desc="Survive, dominate, and win together."
            />
            <HowItWorksStep
              icon={<UserPlus className="w-7 h-7" />}
              title="Invite & Form"
              desc="Create your squad if you click."
            />
            <HowItWorksStep
              icon={<TrendingUp className="w-7 h-7" />}
              title="Grow & Win"
              desc="Earn rewards, unlock bonuses."
            />
          </div>
        </Card>
      </div>

      <div className="relative">
        <Image
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop"
          alt="Background"
          width={800}
          height={400}
          className="object-cover absolute inset-0 opacity-50 rounded-2xl"
        />
        <Card className="relative z-10 bg-gradient-to-r from-green-900/50 to-phantom-purple/50 p-8">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-green-400">PLAY YOUR FIRST SESSION</h3>
              <p className="text-sm md:text-base text-phantom-muted mt-2">
                You&apos;ll automatically be placed in a temporary squad with other solo players.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 flex-1 sm:flex-none">
                JOIN NEXT SESSION
              </Button>
              <Button variant="secondary" className="px-6 py-4 flex-1 sm:flex-none">
                <PlayCircle className="w-6 h-6" />
                <span className="ml-3">HOW IT WORKS</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">DISCOVER SQUADS</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-4 py-3">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-phantom-purple/30 border border-phantom-purple text-phantom-purple"
                : "bg-phantom-surface text-phantom-muted"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {squads.map((squad) => {
          const avatar = AVATARS[0];
          return (
            <Card key={squad.id as string} className="p-6 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-purple-900/30 border-2 border-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl">{avatar?.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-phantom-muted">#{squad.rank as number}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-white">{squad.name as string}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="purple" className="text-xs">💀 Competitive</Badge>
                        <Badge variant="purple" className="text-xs">⚔️ Active</Badge>
                        <Badge variant="purple" className="text-xs">🏆 Victory</Badge>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-phantom-muted mt-3">
                      We strike from the shadows. Loyalty, discipline, victory.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-phantom-bg overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://i.pravatar.cc/40?u=${i}`}
                          alt=""
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-phantom-bg bg-phantom-surface flex items-center justify-center text-xs text-phantom-muted flex-shrink-0">
                      +{squad.remainingSlots as number || 2}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button className="px-6 py-3">
                  VIEW DETAILS
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">RECENT TEAMMATES</p>
          <Link href="#" className="text-xs md:text-sm text-phantom-purple flex items-center gap-2">
            VIEW ALL
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide">
          {players.map((player) => {
            const avatar = AVATARS.find((a) => a.id === player.avatar_id) || AVATARS[0];
            return (
              <div key={player.id as string} className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                  <span className="text-5xl">{avatar?.emoji}</span>
                </div>
                <p className="text-sm md:text-base font-semibold text-white">{player.username as string}</p>
                <p className="text-[10px] text-phantom-muted uppercase">2h ago</p>
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
              <Users className="w-8 h-8 text-phantom-muted" />
            </div>
            <p className="text-sm md:text-base font-semibold text-phantom-muted">More</p>
            <p className="text-[10px] text-phantom-muted uppercase">players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
