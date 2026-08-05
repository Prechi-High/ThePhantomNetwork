"use client";

import { useEffect, useState } from "react";
import { Crown, Shield, Swords, Users } from "lucide-react";
import { CURRENT_SEASON } from "@/lib/brand/terminology";

export interface WorldStatsSnapshot {
  playersOnline: number;
  sessionsStarting: number;
  seasonLabel: string;
  loaded: boolean;
}

const DEFAULT_STATS: WorldStatsSnapshot = {
  playersOnline: 31482,
  sessionsStarting: 143,
  seasonLabel: `SEASON ${CURRENT_SEASON}`,
  loaded: false,
};

function formatCount(n: number): string {
  return n.toLocaleString();
}

export function useWorldStats(): WorldStatsSnapshot {
  const [stats, setStats] = useState<WorldStatsSnapshot>(DEFAULT_STATS);

  useEffect(() => {
    fetch("/api/world/summary")
      .then((r) => r.json())
      .then((data) => {
        const ws = data?.stats;
        setStats({
          playersOnline: ws?.playersOnline ?? DEFAULT_STATS.playersOnline,
          sessionsStarting: ws?.activeSessions ?? DEFAULT_STATS.sessionsStarting,
          seasonLabel: `SEASON ${CURRENT_SEASON}`,
          loaded: true,
        });
      })
      .catch(() => setStats((s) => ({ ...s, loaded: true })));
  }, []);

  return stats;
}

export function LiveStatusPill({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-2.5 py-1 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(57,217,138,0.8)]" />
        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">Live</span>
      </div>
      <p className="mt-1 max-w-[120px] text-[9px] leading-snug text-white/60">
        The world is active. Join the movement.
      </p>
    </div>
  );
}

export function SeasonStatusPill({ seasonLabel }: { seasonLabel?: string }) {
  return (
    <div className="text-right">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b942]/30 bg-black/60 px-2.5 py-1 backdrop-blur-sm">
        <Shield className="h-3 w-3 text-[#f5b942]" />
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#f5b942]">
          {seasonLabel ?? `SEASON ${CURRENT_SEASON}`}
        </span>
      </div>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#f5b942]/80">Live Now</p>
    </div>
  );
}

export function AuthStatsFooter({ stats }: { stats: WorldStatsSnapshot }) {
  const items = [
    { icon: Users, value: formatCount(stats.playersOnline), label: "Players Online", accent: "text-emerald-400" },
    { icon: Swords, value: String(stats.sessionsStarting), label: "Sessions Starting", accent: "text-[#f5b942]" },
    { icon: Crown, value: stats.seasonLabel, label: "In Progress", accent: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
      {items.map(({ icon: Icon, value, label, accent }) => (
        <div key={label} className="flex flex-col items-center text-center">
          <Icon className={`mb-1 h-4 w-4 ${accent}`} />
          <p className="text-sm font-bold tabular-nums text-white">{value}</p>
          <p className="text-[8px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function LiveWorldHeader({
  playersOnline,
  seasonLabel,
}: {
  playersOnline: number;
  seasonLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between px-1">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] font-bold uppercase text-emerald-400">Live World</span>
        </div>
        <p className="mt-1 text-[9px] font-semibold text-emerald-400/90">
          {formatCount(playersOnline)} Players Online
        </p>
      </div>
      <SeasonStatusPill seasonLabel={seasonLabel} />
    </div>
  );
}
