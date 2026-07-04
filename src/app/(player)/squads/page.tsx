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
  Trophy,
  Plus,
  ChevronRight,
  MessageCircle,
  Send,
  Smile,
  Paperclip,
  Settings,
  LogOut,
  Crown,
  Globe,
} from "lucide-react";
import { AVATARS } from "@/types/gameplay";

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((difference / 1000 / 60) % 60)
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((difference / 1000) % 60)
          .toString()
          .padStart(2, "0");
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-white">{timeLeft.hours}</span>
        <span className="text-[10px] text-phantom-muted uppercase">HRS</span>
      </div>
      <span className="text-phantom-purple text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-white">{timeLeft.minutes}</span>
        <span className="text-[10px] text-phantom-muted uppercase">MIN</span>
      </div>
      <span className="text-phantom-purple text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-white">{timeLeft.seconds}</span>
        <span className="text-[10px] text-phantom-muted uppercase">SEC</span>
      </div>
    </div>
  );
}

function SquadPage({ squad }: { squad: Record<string, unknown> }) {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 0, date.getMinutes() + 18, date.getSeconds() + 34, 0);
    return date;
  });
  const [members, setMembers] = useState<Record<string, unknown>[]>([]);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Simulate fetching data
    setMembers([
      {
        id: "1",
        username: "PhantomX",
        avatar_id: AVATARS[0].id,
        role: "leader",
        online: true,
        contribution: 5680,
        tokens: 24850,
      },
      {
        id: "2",
        username: "DarkRider",
        avatar_id: AVATARS[1].id,
        role: "officer",
        online: true,
        contribution: 4320,
        tokens: 22410,
      },
      {
        id: "3",
        username: "NovaStrike",
        avatar_id: AVATARS[2].id,
        role: "member",
        online: true,
        contribution: 4150,
        tokens: 19230,
      },
      {
        id: "4",
        username: "VoidWalker",
        avatar_id: AVATARS[3].id,
        role: "member",
        online: false,
        contribution: 3210,
        tokens: 16540,
      },
      {
        id: "5",
        username: "SilentKiller",
        avatar_id: AVATARS[4].id,
        role: "member",
        online: false,
        contribution: 2980,
        tokens: 15870,
      },
    ]);
    setMessages([
      {
        id: "1",
        sender_username: "PhantomX",
        sender_avatar_id: AVATARS[0].id,
        is_current_user: true,
        text: "Let's look for Nightfall Arena. Top 10 finish is the goal! 🔥",
        time: "4m ago",
        pinned: true,
        reactions: [{ emoji: "🔥", count: 12 }, { emoji: "💀", count: 4 }],
      },
      {
        id: "2",
        sender_username: "DarkRider",
        sender_avatar_id: AVATARS[1].id,
        is_current_user: false,
        text: "I'm ready. Shields up. Let's take the top players.",
        time: "3m ago",
        reactions: [{ emoji: "🛡️", count: 6 }],
      },
      {
        id: "3",
        sender_username: "NovaStrike",
        sender_avatar_id: AVATARS[2].id,
        is_current_user: false,
        text: "Don't forget we have 3 revives. Use them wisely.",
        time: "1m ago",
        reactions: [],
      },
    ]);
    setActivities([
      { id: "1", type: "rank", message: "Eclipse Squad reached Level 18", time: "2h ago" },
      { id: "2", type: "win", message: "We won Nightfall Arena and earned $2,450", time: "5h ago" },
      { id: "3", type: "revive", message: "VoidWalker was revived by NovaStrike", time: "7h ago" },
      { id: "4", type: "steal", message: "DarkRider stole 4 tokens from BloodHawk", time: "9h ago" },
    ]);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/home" className="p-2 rounded-full hover:bg-phantom-surface">
            <ChevronLeft className="w-6 h-6 text-phantom-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">MY SQUAD</h1>
            <p className="text-sm text-phantom-muted">Stronger together. Win together.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-4 py-3">
            <UserPlus className="w-5 h-5" />
            <span className="ml-2">INVITE</span>
          </Button>
          <Button variant="secondary" className="px-4 py-3">
            <Settings className="w-5 h-5" />
            <span className="ml-2">SQUAD SETTINGS</span>
          </Button>
          <Button variant="secondary" className="px-4 py-3 text-red-500 border-red-500/30">
            <LogOut className="w-5 h-5" />
            <span className="ml-2">LEAVE SQUAD</span>
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
          <p className="text-3xl font-mono font-bold text-white">1,340</p>
          <button className="absolute top-4 right-4 p-2 bg-phantom-purple/20 rounded-lg">
            <Plus className="w-5 h-5 text-phantom-purple" />
          </button>
        </Card>
      </div>

      <Card className="p-5 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1600&auto=format&fit=crop"
          alt=""
          width={1600}
          height={400}
          className="absolute inset-0 object-cover opacity-30"
        />
        <div className="relative z-10 flex items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl border-4 border-phantom-purple overflow-hidden bg-gradient-to-br from-phantom-purple/20 to-phantom-surface flex items-center justify-center">
              <span className="text-7xl">{AVATARS[0].emoji}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" className="text-xs">🛡️ OFFICER</Badge>
              <h2 className="text-2xl font-display font-bold text-white">{squad.name as string}</h2>
              <span className="text-phantom-purple text-xl">✓</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="purple" className="text-xs">ECLP</Badge>
              <Badge variant="purple" className="text-xs">INVITE ONLY</Badge>
              <Badge variant="purple" className="text-xs">LVL 18</Badge>
            </div>
            <p className="text-sm text-phantom-muted mt-2">
              We rise from the shadows. Loyalty. Discipline. Victory.
            </p>
            <p className="text-xs text-phantom-muted mt-2">FOUNDED 23 APR 2024</p>
            <p className="text-xs text-phantom-muted">TYPE: Permanent</p>
          </div>
          <div className="text-right">
            <div className="w-32">
              <p className="text-xs text-phantom-muted uppercase">SQUAD LEVEL</p>
              <p className="text-4xl font-display font-bold text-purple-400">18</p>
              <p className="text-xs text-phantom-muted mt-1">2,450 / 3,000 XP</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-xs text-phantom-muted uppercase">SQUAD RANK</p>
          <p className="text-lg font-bold text-white">#3</p>
          <p className="text-xs text-phantom-muted">In Eclipse Camp</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <Globe className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-xs text-phantom-muted uppercase">GLOBAL RANK</p>
          <p className="text-lg font-bold text-white">#27</p>
          <p className="text-xs text-phantom-muted">All Squads</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-phantom-purple" />
          </div>
          <p className="text-xs text-phantom-muted uppercase">MEMBERS</p>
          <p className="text-lg font-bold text-white">24 / 30</p>
          <p className="text-xs text-green-500">8 online</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-xs text-phantom-muted uppercase">SESSIONS WON</p>
          <p className="text-lg font-bold text-white">156</p>
          <p className="text-xs text-green-500">72% Win Rate This Season</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1600&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-phantom-bg via-transparent to-transparent" />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <Badge variant="purple" className="mb-2">NEXT SESSION TOGETHER</Badge>
              <h3 className="text-xl font-bold text-white neon-text">NIGHTFALL ARENA</h3>
              <Badge variant="purple" className="mt-1">SQUAD MODE</Badge>
            </div>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-phantom-muted uppercase">Starts in</p>
                <Countdown targetDate={targetDate} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">💲</span>
                <div>
                  <p className="text-xs text-phantom-muted uppercase">Entry Fee</p>
                  <p className="font-bold text-white">$5</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-phantom-gold text-xl">🏆</span>
                <div>
                  <p className="text-xs text-phantom-muted uppercase">Prize Pool</p>
                  <p className="font-bold text-white">$1,250</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member, i) => {
                  const avatar = AVATARS.find((a) => a.id === member.avatar_id) || AVATARS[0];
                  return (
                    <div
                      key={member.id as string}
                      className="w-8 h-8 rounded-full border-2 border-phantom-bg overflow-hidden bg-phantom-surface flex items-center justify-center"
                    >
                      <span className="text-lg">{avatar?.emoji}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-phantom-muted">8 / 24 Members Registered</p>
              <div className="ml-auto">
                <Button className="px-6 py-3">
                  VIEW SESSION
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">SQUAD ACTIVITY</h3>
            <Link href="#" className="text-xs text-phantom-purple flex items-center gap-1">
              VIEW ALL
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id as string} className="flex items-center gap-3 py-2">
                <div className="text-xl">
                  {activity.type === "rank"
                    ? "⬆️"
                    : activity.type === "win"
                    ? "🏆"
                    : activity.type === "revive"
                    ? "🛡️"
                    : "⚔️"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message as string}</p>
                  <p className="text-xs text-phantom-muted">{activity.time as string}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">SQUAD MEMBERS</h3>
            <Link href="#" className="text-xs text-phantom-purple flex items-center gap-1">
              VIEW ALL
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {members.map((member) => {
              const avatar = AVATARS.find((a) => a.id === member.avatar_id) || AVATARS[0];
              return (
                <div key={member.id as string} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center">
                      <span className="text-2xl">{avatar?.emoji}</span>
                    </div>
                    {member.role === "leader" && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Crown className="w-3 h-3 text-phantom-bg" />
                      </div>
                    )}
                    {(member.online as boolean) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-phantom-bg" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{member.username as string}</p>
                    <p className="text-xs text-phantom-muted">
                      {member.role === "leader" ? "Leader" : member.role === "officer" ? "Officer" : "Member"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-phantom-muted uppercase">CONTRIBUTION</p>
                    <p className="text-sm font-bold text-purple-400">
                      {(member.contribution as number).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-phantom-muted uppercase">TOKENS EARNED</p>
                    <p className="text-sm font-bold text-yellow-500">{(member.tokens as number).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button className="w-full mt-4 py-3 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900">
            <UserPlus className="w-5 h-5" />
            <span className="ml-2">INVITE MEMBERS</span>
          </Button>
        </Card>

        <Card className="p-4 flex flex-col h-96">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">SQUAD CHAT</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-500">8 online</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {messages.map((msg) => {
              const avatar = AVATARS.find((a) => a.id === msg.sender_avatar_id) || AVATARS[0];
              const isCurrentUser = msg.is_current_user;
              return (
                <div
                  key={msg.id as string}
                  className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-phantom-surface flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{avatar?.emoji}</span>
                  </div>
                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <p className="text-xs text-phantom-muted mb-1">
                      {msg.sender_username as string}
                      {(msg.pinned as boolean) && "  📌"}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser ? "bg-phantom-purple rounded-br-none" : "bg-phantom-surface rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm text-white">{msg.text as string}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-phantom-muted">{msg.time as string}</span>
                      {(msg.reactions as Array<Record<string, unknown>>)?.map((reaction: Record<string, unknown>) => (
                        <span
                          key={reaction.emoji as string}
                          className="text-xs px-1 py-0.5 bg-phantom-surface rounded-full"
                        >
                          {reaction.emoji as string} {reaction.count as string | number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-phantom-muted">IrrFang is typing...</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-phantom-border">
            <button className="p-2 rounded-full hover:bg-phantom-surface">
              <Paperclip className="w-5 h-5 text-phantom-muted" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-phantom-surface border border-phantom-border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-phantom-purple"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                <Smile className="w-5 h-5 text-phantom-muted" />
              </button>
            </div>
            <button className="p-3 bg-phantom-purple rounded-full hover:bg-purple-700">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SquadsPage() {
  const [mySquad, setMySquad] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Simulate checking if user has a squad
    setMySquad({ id: "1", name: "Eclipse Squad" });
  }, []);

  return <SquadPage squad={mySquad || { id: "1", name: "Eclipse Squad" }} />;
}
