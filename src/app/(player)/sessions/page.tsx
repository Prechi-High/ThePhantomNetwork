"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { ChevronLeft, Bell, Calendar, Clock, Users, Coins, Trophy, Filter, ChevronRight } from "lucide-react";


interface Session {
  id: string;
  title: string;
  status: "open" | "locked" | "active" | "completed";
  starts_at: string;
  registration_closes_at?: string;
  entry_fee_cents: number;
  registered_count: number;
  total_pool_cents: number;
  max_players?: number;
  format?: string;
  description?: string;
  is_featured?: boolean;
  image_url?: string;
  is_user_registered?: boolean;
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)))
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
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">
          {timeLeft.hours}
        </span>
        <span className="text-xs text-phantom-muted uppercase mt-1">HRS</span>
      </div>
      <span className="text-phantom-purple text-3xl md:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">
          {timeLeft.minutes}
        </span>
        <span className="text-xs text-phantom-muted uppercase mt-1">MIN</span>
      </div>
      <span className="text-phantom-purple text-3xl md:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="font-mono text-4xl md:text-5xl font-bold text-white">
          {timeLeft.seconds}
        </span>
        <span className="text-xs text-phantom-muted uppercase mt-1">SEC</span>
      </div>
    </div>
  );
}

function SessionItem({ session }: { session: Session }) {
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `TODAY ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `TOMORROW ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const handleJoinSession = async () => {
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/join`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to join session");
      }
      window.location.reload();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setJoining(false);
    }
  };

  const sessionImages = [
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279850a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470252649378-98427e0a8990?q=80&w=800&auto=format&fit=crop",
  ];

  const renderActionButtons = () => {
    switch (session.status) {
      case "open":
        if (session.is_user_registered) {
          return (
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Button
                variant="secondary"
                className="px-6 py-3 bg-phantom-surface border border-phantom-border w-full md:w-auto"
                disabled
              >
                ALREADY REGISTERED
              </Button>
            </div>
          );
        }
        return (
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button
              className="px-6 py-3 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold w-full md:w-auto"
              onClick={handleJoinSession}
              disabled={joining}
            >
              {joining ? "JOINING..." : "JOIN NOW"}
            </Button>
            <Button
              variant="secondary"
              className="px-6 py-3 bg-phantom-surface border border-phantom-border w-full md:w-auto"
            >
              <Bell className="w-5 h-5 mr-2" />
              SET REMINDER
            </Button>
          </div>
        );
      case "locked":
      case "completed":
        return (
          <Button
            variant="secondary"
            className="px-6 py-3 bg-phantom-surface border border-phantom-border w-full md:w-auto"
          >
            <Bell className="w-5 h-5 mr-2" />
            SET REMINDER
          </Button>
        );
      case "active":
        if (session.is_user_registered) {
          return (
            <Button
              className="px-6 py-3 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold w-full md:w-auto"
              onClick={() => router.push(`/play/${session.id}`)}
            >
              ENTER GAMEPLAY
            </Button>
          );
        }
        return (
          <Button
            variant="secondary"
            className="px-6 py-3 bg-phantom-surface border border-phantom-border w-full md:w-auto"
            disabled
          >
            SESSION IN PROGRESS
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <Image
            src={
              session.image_url || sessionImages[Math.floor(Math.random() * sessionImages.length)]
            }
            alt={session.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-phantom-bg via-transparent to-transparent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-phantom-muted uppercase tracking-widest mb-2">
            {formatDate(session.starts_at)}
          </p>
          <h3 className="text-xl md:text-2xl font-display font-bold text-white truncate">
            {session.title}
          </h3>
          <Badge variant="purple" className="mt-3">
            {session.format || "SOLO / SQUAD"}
          </Badge>

          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-phantom-gold text-xl">🏆</span>
              <div>
                <p className="text-xs text-phantom-muted uppercase">Prize Pool</p>
                <p className="text-base font-bold text-phantom-gold">
                  ${(session.total_pool_cents / 100).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xl">💲</span>
              <div>
                <p className="text-xs text-phantom-muted uppercase">Entry</p>
                <p className="text-base font-bold">
                  ${(session.entry_fee_cents / 100).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-phantom-muted text-xl">👥</span>
              <div>
                <p className="text-xs text-phantom-muted uppercase">Registered</p>
                <p className="text-base font-bold">
                  {session.registered_count} / {session.max_players || 200}
                </p>
              </div>
            </div>
          </div>
        </div>

        {renderActionButtons()}
      </div>
      {joinError && (
        <div className="px-6 pb-6">
          <p className="text-phantom-danger text-sm">{joinError}</p>
        </div>
      )}
    </Card>
  );
}

function HowItWorksStep({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
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

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "live" | "completed">(
    "upcoming"
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sessions");
      const d = await res.json();
      setSessions(d.sessions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter((session) => {
    if (activeTab === "upcoming") {
      return session.status === "open" || session.status === "locked";
    } else if (activeTab === "live") {
      return session.status === "active";
    } else {
      return session.status === "completed";
    }
  });

  const featuredSession = filteredSessions.find((s) => s.is_featured) || filteredSessions[0];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-3 rounded-full hover:bg-phantom-surface">
          <ChevronLeft className="w-7 h-7 text-phantom-muted" />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">SESSIONS</h1>
          <p className="text-sm md:text-base text-phantom-muted">Compete. Survive. Win.</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-phantom-surface">
            <Bell className="w-7 h-7 text-phantom-muted" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-phantom-danger rounded-full" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all ${
            activeTab === "upcoming"
              ? "bg-phantom-purple/20 text-phantom-purple border border-phantom-purple"
              : "bg-phantom-surface border border-phantom-border text-phantom-muted"
          }`}
        >
          <Calendar className="w-5 h-5" />
          UPCOMING
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all ${
            activeTab === "live"
              ? "bg-phantom-purple/20 text-phantom-purple border border-phantom-purple"
              : "bg-phantom-surface border border-phantom-border text-phantom-muted"
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          LIVE NOW
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all ${
            activeTab === "completed"
              ? "bg-phantom-purple/20 text-phantom-purple border border-phantom-purple"
              : "bg-phantom-surface border border-phantom-border text-phantom-muted"
          }`}
        >
          <Clock className="w-5 h-5" />
          COMPLETED
        </button>
      </div>

      {/* TIMEZONE INFO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-phantom-muted flex items-center gap-2">
          <Clock className="w-5 h-5" />
          All times shown in your local time (WAT)
        </p>
        <Button
          variant="secondary"
          className="px-4 py-3 text-sm flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filter
        </Button>
      </div>

      {/* NEXT UP FEATURED SESSION */}
      {activeTab === "upcoming" && featuredSession && (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
            NEXT UP
          </p>
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
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div>
                  <Badge
                  variant="purple"
                  className="mb-3"
                >
                  FEATURED
                </Badge>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white neon-text">
                    {featuredSession.title}
                  </h2>
                  <Badge variant="purple" className="mt-3">
                    {featuredSession.format || "SOLO / SQUAD"}
                  </Badge>
                  <p className="text-xs md:text-sm text-phantom-muted mt-3">
                    {featuredSession.description || "High stakes. High rewards. Only the strong survive."}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <p className="text-xs text-phantom-muted uppercase mb-3">Starts in</p>
                  <Countdown
                    targetDate={new Date(featuredSession.starts_at)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-2xl">💲</span>
                  <div>
                    <p className="text-xs text-phantom-muted uppercase">Entry Fee</p>
                    <p className="font-bold text-xl">
                      ${(featuredSession.entry_fee_cents / 100).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-phantom-gold text-2xl">🏆</span>
                  <div>
                    <p className="text-xs text-phantom-muted uppercase">Prize Pool</p>
                    <p className="font-bold text-xl">
                      ${(featuredSession.total_pool_cents / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-phantom-muted text-2xl">👥</span>
                  <div>
                    <p className="text-xs text-phantom-muted uppercase">Registered</p>
                    <p className="font-bold text-xl">
                      {featuredSession.registered_count} / {featuredSession.max_players || 200}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-phantom-muted text-2xl">⏱️</span>
                  <div>
                    <p className="text-xs text-phantom-muted uppercase">Format</p>
                    <p className="font-bold text-xl">20 MIN</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
            {featuredSession.status === "open" && (
              featuredSession.is_user_registered ? (
                <Button
                  variant="secondary"
                  className="w-full py-4"
                  disabled
                >
                  ALREADY REGISTERED
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              ) : (
                <Link href={`/sessions/${featuredSession.id}`} className="flex-1">
                  <Button className="w-full py-4 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                    JOIN NOW
                    <ChevronRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
              )
            )}
            {featuredSession.status === "active" && featuredSession.is_user_registered && (
              <Link href={`/play/${featuredSession.id}`} className="flex-1">
                <Button className="w-full py-4 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  ENTER GAMEPLAY
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            )}
            {(featuredSession.status === "locked" || featuredSession.status === "completed" || (featuredSession.status === "active" && !featuredSession.is_user_registered)) && (
              <Link href={`/sessions/${featuredSession.id}`} className="flex-1">
                <Button className="w-full py-4 bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  VIEW DETAILS
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            )}
          </div>
            </div>
          </Card>
        </div>
      )}

      {/* UPCOMING SESSIONS LIST */}
      <div className="space-y-4">
        {activeTab === "upcoming" && (
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
            UPCOMING SESSIONS
          </p>
        )}
        {activeTab === "live" && (
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            LIVE NOW
          </p>
        )}
        {activeTab === "completed" && (
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
            PAST SESSIONS
          </p>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                  <div className="w-24 h-24 rounded-xl bg-phantom-surface animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-32 bg-phantom-surface rounded animate-pulse" />
                    <div className="h-6 w-64 bg-phantom-surface rounded animate-pulse" />
                    <div className="h-5 w-40 bg-phantom-surface rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="p-6">
            <p className="text-phantom-danger text-base">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={loadSessions}>
              Retry
            </Button>
          </Card>
        )}

        {!loading && !error && filteredSessions.length === 0 && (
          <Card className="p-6">
            <p className="text-phantom-muted text-base">
              No {activeTab === "upcoming" ? "upcoming" : activeTab === "live" ? "live" : "completed"} sessions.
            </p>
          </Card>
        )}

        {!loading &&
          !error &&
          filteredSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
      </div>

      {/* REMINDERS CARD */}
      <Card className="border border-phantom-purple/30 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-phantom-purple/20 border border-phantom-purple flex items-center justify-center text-phantom-purple flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-xl">Never Miss a Session</h3>
            <p className="text-sm md:text-base text-phantom-muted mt-1">
              Set reminders and get notified before every session starts.
            </p>
          </div>
          <Button className="bg-gradient-to-r from-phantom-purple to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-4 px-6 w-full sm:w-auto">
            MANAGE REMINDERS
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>

      {/* HOW SESSIONS WORK */}
      <div className="space-y-4">
        <p className="text-sm md:text-base font-bold uppercase tracking-widest text-phantom-muted">
          HOW SESSIONS WORK
        </p>
        <Card className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <HowItWorksStep
              icon={<Users className="w-7 h-7" />}
              title="1 JOIN"
              desc="Register and enter the arena."
            />
            <HowItWorksStep
              icon={<Coins className="w-7 h-7" />}
              title="2 SPIN & EARN"
              desc="Spin the wheel, earn tokens."
            />
            <HowItWorksStep
              icon={<div className="w-7 h-7 flex items-center justify-center">💀</div>}
              title="3 SURVIVE"
              desc="Outlast others, avoid elimination."
            />
            <HowItWorksStep
              icon={<Trophy className="w-7 h-7" />}
              title="4 RANK"
              desc="Climb the ranks in 4 phases."
            />
            <HowItWorksStep
              icon={<div className="w-7 h-7 flex items-center justify-center">🏆</div>}
              title="5 WIN"
              desc="Top players win real cash rewards."
            />
          </div>
        </Card>
      </div>

    </div>
  );
}
