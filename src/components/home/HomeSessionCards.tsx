"use client";

import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { CountdownHero, PrimaryCTA } from "@/components/design-system";

interface SessionData {
  id: string;
  title: string;
  starts_at: string;
  entry_fee_cents?: number;
  registered_count?: number;
  max_players?: number;
  total_pool_cents?: number;
}

interface HomeNextSessionCardProps {
  session: SessionData | null;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function HomeNextSessionCard({ session }: HomeNextSessionCardProps) {
  if (!session) {
    return (
      <div className="rounded-2xl border border-purple-500/30 bg-black/60 p-5 text-center">
        <p className="text-sm text-white/50">No live session open</p>
        <PrimaryCTA href="/sessions" className="mt-4">
          View Sessions
        </PrimaryCTA>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 to-black/80 p-4 shadow-[0_0_24px_rgba(124,58,237,0.15)]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-purple-400">Next Live Session</p>

      <div className="my-4 flex justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-purple-500/40 bg-purple-950/50 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
          <Globe className="h-10 w-10 text-purple-400" />
        </div>
      </div>

      <CountdownHero targetDate={session.starts_at} className="mb-4" />

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[10px]">
        <div>
          <p className="text-white/40">Entry Fee</p>
          <p className="font-bold text-white">{formatMoney(session.entry_fee_cents ?? 100)}</p>
        </div>
        <div>
          <p className="text-white/40">Players</p>
          <p className="font-bold text-white">
            {session.registered_count ?? 0}/{session.max_players ?? 200}
          </p>
        </div>
        <div>
          <p className="text-white/40">Prize Pool</p>
          <p className="font-bold text-emerald-400">
            {formatMoney(session.total_pool_cents ?? 62400)}
          </p>
        </div>
      </div>

      <PrimaryCTA href={`/sessions/${session.id}`}>
        <span className="flex items-center justify-center gap-2">
          JOIN SESSION
          <ArrowRight className="h-4 w-4" />
        </span>
      </PrimaryCTA>
    </div>
  );
}

interface HomeLiveSessionsRowProps {
  sessions: SessionData[];
}

export function HomeLiveSessionsRow({ sessions }: HomeLiveSessionsRowProps) {
  const live = sessions.filter((s) => s.id).slice(0, 3);

  return (
    <section className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Live Sessions</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {live.map((s, i) => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            className={`shrink-0 rounded-xl border p-3 ${
              i === live.length - 1
                ? "w-[140px] border-[#f5b942]/40 bg-[#f5b942]/5"
                : "w-[120px] border-purple-500/30 bg-black/50"
            }`}
          >
            {i === live.length - 1 && (
              <p className="mb-1 text-[8px] font-bold uppercase text-[#f5b942]">Championship</p>
            )}
            <p className="text-xs font-bold text-white">#{s.title.replace(/\D/g, "").slice(-3) || i + 428}</p>
            <p className="mt-1 text-[9px] text-white/40">
              {formatMoney(s.entry_fee_cents ?? (i === live.length - 1 ? 2500 : 100))} entry
            </p>
            <p className="text-[9px] font-bold text-emerald-400">
              {formatMoney(s.total_pool_cents ?? (i === live.length - 1 ? 250000 : 62400))} pool
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase text-purple-400">Join ›</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
