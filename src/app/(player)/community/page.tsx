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
    <div className="flex flex-col items-center text-center gap-2 flex-1">
      <div className="w-12 h-12 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-phantom-purple">
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-phantom-muted leading-tight">{desc}</p>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/home" className="p-2 rounded-full hover:bg-phantom-surface">
            <ChevronLeft className="w-6 h-6 text-phantom-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-phantom-purple">COMMUNITY</h1>
            <h2 className="text-2xl font-display font-bold text-white">FIND YOUR SQUAD</h2>
            <p className="text-sm text-phantom-muted">
              You don&apos;t have a permanent squad yet. Find teammates. Win together. Build something legendary.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-4 py-3">
            <UserPlus className="w-5 h-5" />
            <span className="ml-2">INVITE FRIENDS</span>
          </Button>
          <Button className="px-4 py-3 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900">
            <Users className="w-5 h-5" />
            <span className="ml-2">CREATE SQUAD</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500 text-xl">💲</span>
            <span className="text-sm text-phantom-muted uppercase">Wallet Balance</span>
            <span className="ml-auto text-xs bg-phantom-surface px-2 py-1 rounded text-phantom-muted">USD</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">$25.00</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-phantom-purple text-xl">💎</span>
            <span className="text-sm text-phantom-muted uppercase">Phantom Tokens</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">250</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
        <Card className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-xl">🔶</span>
            <span className="text-sm text-phantom-muted uppercase">Squad Tokens</span>
          </div>
          <p className="text-3xl font-mono font-bold text-white">0</p>
          <p className="text-[10px] text-phantom-muted mt-1">Earn after your first completed session</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-green-500 animate-pulse">●</span>
          <span className="text-sm font-semibold text-white">1,342 PLAYERS ONLINE</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-phantom-muted text-sm">286 SQUADS ACTIVE</span>
          <span className="text-phantom-muted text-sm ml-4">24 SESSIONS TODAY</span>
          <span className="text-phantom-muted text-sm ml-4">32 NEW SQUADS TODAY</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">HOW SQUADS WORK</p>
        <Card className="p-4">
          <div className="flex justify-between gap-3">
            <HowItWorksStep
              icon={<PlayCircle className="w-6 h-6" />}
              title="Play a Session"
              desc="You'll be paired with teammates."
            />
            <HowItWorksStep
              icon={<Users className="w-6 h-6" />}
              title="Perform Together"
              desc="Survive, dominate, and win together."
            />
            <HowItWorksStep
              icon={<UserPlus className="w-6 h-6" />}
              title="Invite & Form"
              desc="Create your squad if you click."
            />
            <HowItWorksStep
              icon={<TrendingUp className="w-6 h-6" />}
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
        <Card className="relative z-10 bg-gradient-to-r from-green-900/50 to-phantom-purple/50 p-6">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-400">PLAY YOUR FIRST SESSION</h3>
              <p className="text-sm text-phantom-muted">
                You&apos;ll automatically be placed in a temporary squad with other solo players.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                JOIN NEXT SESSION
              </Button>
              <Button variant="secondary" className="px-4 py-3">
                <PlayCircle className="w-5 h-5" />
                <span className="ml-2">HOW IT WORKS</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">DISCOVER SQUADS</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-3 py-2">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-phantom-purple/30 border border-phantom-purple text-phantom-purple"
                : "bg-phantom-surface text-phantom-muted"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {squads.map((squad) => {
          const avatar = AVATARS[0];
          return (
            <Card key={squad.id as string} className="p-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-900/30 border-2 border-purple-700 flex items-center justify-center">
                    <span className="text-3xl">{avatar?.emoji}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-phantom-muted">#{squad.rank as number}</span>
                      <h3 className="text-lg font-bold text-white">{squad.name as string}</h3>
                      <div className="flex gap-1">
                        <Badge variant="purple" className="text-[10px]">💀 Competitive</Badge>
                        <Badge variant="purple" className="text-[10px]">⚔️ Active</Badge>
                        <Badge variant="purple" className="text-[10px]">🏆 Victory</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-phantom-muted mt-1">
                      We strike from the shadows. Loyalty, discipline, victory.
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-phantom-bg overflow-hidden">
                      <Image
                        src={`https://i.pravatar.cc/32?u=${i}`}
                        alt=""
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-phantom-bg bg-phantom-surface flex items-center justify-center text-xs text-phantom-muted">
                    +{squad.remainingSlots as number || 2}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button className="px-5 py-2">
                  VIEW DETAILS
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">RECENT TEAMMATES</p>
          <Link href="#" className="text-xs text-phantom-purple flex items-center gap-1">
            VIEW ALL
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {players.map((player) => {
            const avatar = AVATARS.find((a) => a.id === player.avatar_id) || AVATARS[0];
            return (
              <div key={player.id as string} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                  <span className="text-3xl">{avatar?.emoji}</span>
                </div>
                <p className="text-sm font-semibold text-white">{player.username as string}</p>
                <p className="text-[10px] text-phantom-muted uppercase">2h ago</p>
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
              <Users className="w-6 h-6 text-phantom-muted" />
            </div>
            <p className="text-sm font-semibold text-phantom-muted">More</p>
            <p className="text-[10px] text-phantom-muted uppercase">players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
