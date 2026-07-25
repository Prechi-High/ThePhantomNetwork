"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LiveFeed } from "@/components/gameplay/hud/LiveFeed";

export default function SessionLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<{
    title: string;
    registered_count: number;
    max_players: number;
    total_pool_cents: number;
    starts_at: string;
    status: string;
  } | null>(null);
  const [countdown, setCountdown] = useState("");
  const [recentWinners] = useState([
    { name: "Alex", amount: "$42.50", rank: 1 },
    { name: "Mia", amount: "$28.00", rank: 2 },
    { name: "David", amount: "$15.75", rank: 3 },
  ]);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => setSession(d.session));
    const interval = setInterval(() => {
      fetch(`/api/sessions/${sessionId}`)
        .then((r) => r.json())
        .then((d) => setSession(d.session));
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (!session?.starts_at) return;
    const tick = () => {
      const diff = new Date(session.starts_at).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Starting...");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session?.starts_at]);

  const playerCount = session?.registered_count ?? 0;

  return (
    <div className="min-h-screen bg-phantom-bg p-4 pb-8">
      <div className="container-responsive space-y-6">
        <div className="text-center pt-6">
          <p className="text-xs uppercase tracking-widest text-phantom-muted">Waiting Lobby</p>
          <h1 className="font-display text-2xl font-bold mt-1">{session?.title ?? "Session"}</h1>
        </div>

        <Card className="text-center space-y-2 py-6">
          <p className="text-sm text-phantom-muted">Players Joined</p>
          <motion.p
            key={playerCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-5xl font-bold text-phantom-purple"
          >
            {playerCount}
            <span className="text-phantom-muted text-2xl">/{session?.max_players ?? "—"}</span>
          </motion.p>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center py-4">
            <p className="text-xs text-phantom-muted uppercase">Reward Pool</p>
            <p className="text-xl font-bold text-phantom-gold">
              ${((session?.total_pool_cents ?? 0) / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-xs text-phantom-muted uppercase">Countdown</p>
            <p className="text-xl font-bold font-mono">{countdown || "—"}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-semibold uppercase text-phantom-muted mb-3">Recent Winners</h2>
          <div className="space-y-2">
            {recentWinners.map((w) => (
              <div key={w.name} className="flex justify-between text-sm">
                <span>#{w.rank} {w.name}</span>
                <span className="text-phantom-gold">{w.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[120px]">
          <h2 className="text-sm font-semibold uppercase text-phantom-muted mb-2">Live Activity</h2>
          <LiveFeed />
        </Card>

        <Button
          className="w-full"
          size="lg"
          disabled={session?.status !== "active" && countdown !== "Starting..."}
          onClick={() => router.push(`/play/${sessionId}`)}
        >
          {session?.status === "active" ? "Enter Gameplay" : `Starts in ${countdown}`}
        </Button>
      </div>
    </div>
  );
}
