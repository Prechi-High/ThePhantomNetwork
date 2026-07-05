"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronRight, Users, Trophy, Coins, TrendingUp, Globe, Skull, Sparkles, Zap, Crown } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";

function StatCard({ icon, value, label, colorClass = "text-phantom-purple" }: { icon: React.ReactNode; value: string; label: string; colorClass?: string }) {
  return (
    <div className="text-center flex flex-col items-center gap-2 p-4">
      <div className={`${colorClass} flex items-center justify-center p-2`}>
        {icon}
      </div>
      <p className="font-bold text-xl md:text-2xl">{value}</p>
      <p className="text-xs text-phantom-muted uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
        const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, "0");
        const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, "0");
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">{timeLeft.hours}</span>
        <span className="text-xs text-phantom-muted uppercase mt-1">Hrs</span>
      </div>
      <span className="text-phantom-purple text-3xl md:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">{timeLeft.minutes}</span>
        <span className="text-xs text-phantom-muted uppercase mt-1">Min</span>
      </div>
      <span className="text-phantom-purple text-3xl md:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">{timeLeft.seconds}</span>
        <span className="text-xs text-phantom-muted uppercase mt-1">Sec</span>
      </div>
    </div>
  );
}

function LivePayout({ avatar, name, amount, time, badge }: { avatar: string; name: string; amount: string; time: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between py-4 px-5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-phantom-border overflow-hidden">
            <Image src={avatar} alt={name} width={56} height={56} className="object-cover" />
          </div>
          {badge && (
            <div className="absolute -bottom-1 -right-1 bg-phantom-gold text-phantom-bg text-xs font-bold px-2 py-1 rounded-lg">
              {badge}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-base">{name}</p>
          <p className="text-xs text-phantom-muted">{time}</p>
        </div>
      </div>
      <p className="font-bold text-phantom-gold text-xl">{amount}</p>
    </div>
  );
}

function HowItWorksStep({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 flex-1">
      <div className="w-14 h-14 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-phantom-purple">
        {icon}
      </div>
      <div>
        <p className="font-bold text-base">{title}</p>
        <p className="text-xs text-phantom-muted leading-snug mt-1">{desc}</p>
      </div>
    </div>
  );
}

function WorldActivityItem({ icon, text, time, colorClass = "text-phantom-purple" }: { icon: React.ReactNode; text: string; time: string; colorClass?: string }) {
  return (
    <div className="flex items-center gap-4 py-4 px-5">
      <div className={`w-10 h-10 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base truncate">{text}</p>
      </div>
      <p className="text-xs text-phantom-muted flex-shrink-0">{time}</p>
      <ChevronRight className="w-5 h-5 text-phantom-muted flex-shrink-0" />
    </div>
  );
}

export default function HomePage() {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 0, date.getMinutes() + 18, date.getSeconds() + 34, 0);
    return date;
  });
  const [sessions, setSessions] = useState<{ id: string; title: string; status: string; starts_at: string; entry_fee_cents: number; total_pool_cents: number; registered_count: number; max_players?: number; is_featured?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        setSessions(data.sessions ?? []);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const nextSession = sessions.find((s) => s.is_featured) || sessions[0];

  return (
    <div className="space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-phantom-purple overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop"
                alt="Profile"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <div className="absolute -top-1 -left-1 bg-phantom-purple text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
              1
            </div>
          </div>
          <div>
            <p className="text-xs text-phantom-muted uppercase tracking-widest mb-1">Welcome to</p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white neon-text">
              THE PHANTOM
            </h1>
            <p className="text-sm md:text-base text-phantom-muted italic mt-1">Shadow in. Rise above.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto flex-wrap lg:flex-nowrap">
          {/* WALLET CARD */}
          <div className="glass rounded-xl px-4 py-3 flex flex-col items-end flex-1 lg:flex-none min-w-[160px]">
            <p className="text-[10px] text-phantom-muted uppercase mb-1">Wallet Balance</p>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold text-xl">💲</span>
              <span className="text-2xl font-bold text-white">25.00</span>
              <span className="text-[10px] text-phantom-muted">(USD)</span>
            </div>
          </div>
          {/* PHANTOM TOKENS CARD */}
          <div className="glass rounded-xl px-4 py-3 flex flex-col items-end flex-1 lg:flex-none min-w-[160px]">
            <p className="text-[10px] text-phantom-muted uppercase mb-1">Phantom Tokens</p>
            <div className="flex items-center gap-2">
              <span className="text-phantom-purple font-bold text-xl">💎</span>
              <span className="text-2xl font-bold text-white">250</span>
            </div>
          </div>
          <button className="relative ml-auto lg:ml-0 p-3 rounded-full hover:bg-phantom-surface/50">
            <Bell className="w-7 h-7 text-phantom-muted" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-phantom-danger rounded-full animate-pulse" />
          </button>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value="1,342"
          label="Players Online"
          colorClass="text-green-500"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          value="8"
          label="Sessions Live"
        />
        <StatCard
          icon={<Coins className="w-6 h-6" />}
          value="$24,850"
          label="Total Pool Today"
          colorClass="text-phantom-gold"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          value="$5,320"
          label="Paid in Last 24h"
          colorClass="text-phantom-gold"
        />
      </div>

      {/* NEXT SESSION */}
      <Card className="relative overflow-hidden p-0">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1600&auto=format&fit=crop"
            alt="Nightfall Arena"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-phantom-bg via-transparent to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-phantom-muted uppercase tracking-widest mb-2">Next Session</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white neon-text">
                  {nextSession?.title || "NIGHTFALL ARENA"}
                </h2>
                <Badge variant="purple" className="mt-3">
                  Solo / Squad
                </Badge>
              </div>
              <div className="flex flex-col items-start md:items-end">
                <p className="text-xs text-phantom-muted uppercase mb-2">Starts in</p>
                <Countdown targetDate={nextSession ? new Date(nextSession.starts_at) : targetDate} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-green-500 text-2xl">💲</span>
                <div>
                  <p className="text-xs text-phantom-muted uppercase">Entry Fee</p>
                  <p className="font-bold text-xl">${nextSession ? (nextSession.entry_fee_cents / 100).toFixed(0) : "5"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-phantom-gold text-2xl">🏆</span>
                <div>
                  <p className="text-xs text-phantom-muted uppercase">Prize Pool</p>
                  <p className="font-bold text-xl">${nextSession ? (nextSession.total_pool_cents / 100).toLocaleString() : "1,250"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-phantom-bg overflow-hidden">
                    <Image
                      src={`https://i.pravatar.cc/48?u=${i}`}
                      alt=""
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm md:text-base text-phantom-muted">{nextSession ? `${nextSession.registered_count} / ${nextSession.max_players || 200}` : "32 / 200"} Players Registered</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href={nextSession ? `/sessions/${nextSession.id}` : "/sessions"} className="w-full sm:flex-1">
                <Button className="w-full py-4 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  JOIN SESSION
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            <Button variant="secondary" className="w-full sm:w-auto py-4 px-8">
              <Bell className="w-6 h-6" />
              <span className="ml-2">Set Reminder</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* LIVE PAYOUTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
            <span className="text-phantom-danger mr-2">●</span> Live Payouts
          </p>
          <Link href="#" className="text-sm text-phantom-purple flex items-center gap-1">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <Card className="p-0">
          <div className="flex overflow-x-auto scrollbar-hide">
            <LivePayout
              avatar="https://i.pravatar.cc/48?u=1"
              name="Eclipse"
              amount="$850"
              time="12s ago"
              badge="1st"
            />
            <div className="w-px bg-phantom-border-subtle" />
            <LivePayout
              avatar="https://i.pravatar.cc/48?u=2"
              name="Shadow Legion"
              amount="$320"
              time="28s ago"
            />
            <div className="w-px bg-phantom-border-subtle" />
            <LivePayout
              avatar="https://i.pravatar.cc/48?u=3"
              name="Dark Riders"
              amount="$185"
              time="45s ago"
              badge="3rd"
            />
            <div className="w-px bg-phantom-border-subtle" />
            <div className="flex-shrink-0 px-6 py-3 flex flex-col items-center justify-center">
              <p className="text-xs text-phantom-muted">+17 payouts</p>
              <p className="text-xs text-phantom-gold">in the last 2 minutes</p>
              <span className="text-2xl mt-2">🏅</span>
            </div>
          </div>
        </Card>
      </div>

      {/* YOUR SITUATION & BONUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-phantom-purple">
          <p className="text-xs text-phantom-muted uppercase tracking-widest mb-4">Your Situation</p>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center text-4xl flex-shrink-0">
              👥
            </div>
            <div className="flex-1">
              <p className="text-sm md:text-base text-phantom-muted leading-snug">
                You&apos;re not in a permanent squad yet. Don&apos;t worry. You&apos;ll automatically be teamed with other players in your first session.
              </p>
              <p className="text-sm md:text-base text-phantom-purple font-semibold mt-2">
                Find teammates. Win together. Build something legendary.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/squads" className="flex-1">
              <Button className="w-full py-3">
                EXPLORE SQUADS
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="secondary" className="flex-1 py-3">
              SKIP FOR NOW
            </Button>
          </div>
        </Card>

        <Card className="border-l-4 border-l-phantom-gold bg-gradient-to-br from-phantom-surface to-transparent">
          <p className="text-xs text-phantom-muted uppercase tracking-widest mb-4 text-phantom-gold">First Session Bonus</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm md:text-base text-phantom-muted leading-snug mb-4">
                Play your first session and earn a bonus!
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-phantom-surface/80 rounded-lg px-4 py-2">
                  <span className="text-green-500 text-xl">💲</span>
                  <span className="font-bold text-green-500 text-lg">+ $2</span>
                  <span className="text-xs text-phantom-muted">Wallet</span>
                </div>
                <div className="flex items-center gap-2 bg-phantom-surface/80 rounded-lg px-4 py-2">
                  <span className="text-phantom-purple text-xl">💎</span>
                  <span className="font-bold text-phantom-purple text-lg">+ 100</span>
                  <span className="text-xs text-phantom-muted">Tokens</span>
                </div>
              </div>
              <p className="text-[10px] text-phantom-muted mt-3">0 / 1 SESSION</p>
            </div>
            <div className="text-6xl">
              📦
            </div>
          </div>
        </Card>
      </div>

      {/* HOW IT WORKS */}
      <div className="space-y-4">
        <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
          How It Works
        </p>
        <Card className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <HowItWorksStep
              icon={<Users className="w-7 h-7" />}
              title="Join a Session"
              desc="Register, enter, and compete."
            />
            <HowItWorksStep
              icon={<Sparkles className="w-7 h-7" />}
              title="Spin & Earn"
              desc="Spin the wheel, earn tokens."
            />
            <HowItWorksStep
              icon={<Skull className="w-7 h-7" />}
              title="Survive & Win"
              desc="Outplay others, climb the ranks."
            />
            <HowItWorksStep
              icon={<Coins className="w-7 h-7" />}
              title="Get Paid"
              desc="Top players win real cash rewards."
            />
            <HowItWorksStep
              icon={<Crown className="w-7 h-7" />}
              title="Grow & Rise"
              desc="Level up, rank up, become legendary."
            />
          </div>
        </Card>
      </div>

      {/* WORLD ACTIVITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted flex items-center gap-2">
            <Globe className="w-5 h-5" /> World Activity
          </p>
          <Link href="#" className="text-sm text-phantom-purple flex items-center gap-1">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <Card className="p-0">
          <WorldActivityItem
            icon={<Users className="w-5 h-5" />}
            text="87 players just joined Nightfall Arena"
            time="18s ago"
            colorClass="text-blue-500"
          />
          <div className="h-px bg-phantom-border-subtle" />
          <WorldActivityItem
            icon={<Trophy className="w-5 h-5" />}
            text="Shadow Legion reached Level 12"
            time="48s ago"
            colorClass="text-phantom-gold"
          />
          <div className="h-px bg-phantom-border-subtle" />
          <WorldActivityItem
            icon={<TrendingUp className="w-5 h-5" />}
            text="Eclipse Squad won $650 in Nightfall Arena"
            time="1m ago"
            colorClass="text-green-500"
          />
          <div className="h-px bg-phantom-border-subtle" />
          <WorldActivityItem
            icon={<Zap className="w-5 h-5" />}
            text="Nova Squad activated a Shield"
            time="2m ago"
            colorClass="text-phantom-purple"
          />
        </Card>
      </div>

      {/* BOTTOM BANNER */}
      <Card className="p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-phantom-border overflow-hidden flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=300&auto=format&fit=crop"
                alt=""
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-phantom-muted uppercase mb-1">Next Session: {nextSession?.title || "Nightfall Arena"}</p>
              <Countdown targetDate={nextSession ? new Date(nextSession.starts_at) : targetDate} />
            </div>
          </div>
          <Link href={nextSession ? `/sessions/${nextSession.id}` : "/sessions"} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-4 px-8">
              JOIN NOW
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>

    </div>
  );
}
