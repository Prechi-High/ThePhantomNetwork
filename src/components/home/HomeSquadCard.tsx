"use client";

import Link from "next/link";
import { Users } from "lucide-react";

interface SquadData {
  name: string;
  memberCount?: number;
  rank?: number;
  influence?: number;
  growth?: string;
  objective?: string;
  objectivePct?: number;
}

interface HomeSquadCardProps {
  squad: SquadData | null;
}

export function HomeSquadCard({ squad }: HomeSquadCardProps) {
  if (!squad) {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl border border-[#f5b942]/25 bg-black/60 p-3 text-center">
        <p className="text-xs text-white/50">No squad yet</p>
        <Link href="/squads" className="mt-2 text-[10px] font-bold uppercase text-[#f5b942]">
          Join a Squad ›
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#f5b942]/25 bg-black/60 p-3">
      <p className="text-[9px] font-bold uppercase text-[#f5b942]">Your Squad</p>
      <p className="mt-1 font-bold text-white">{squad.name}</p>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
        <Users className="h-3 w-3" />
        <span>{squad.memberCount ?? 0} Members Online</span>
      </div>
      <p className="mt-1 text-[10px] text-white/50">Squad Rank #{squad.rank ?? "—"}</p>
      <p className="text-[10px] text-white/70">
        Influence {(squad.influence ?? 0).toLocaleString()}{" "}
        <span className="text-emerald-400">({squad.growth ?? "+0%"})</span>
      </p>
      {squad.objective && (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[9px] text-white/40">
            <span>{squad.objective}</span>
            <span>{squad.objectivePct ?? 0}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#f5b942]"
              style={{ width: `${squad.objectivePct ?? 0}%` }}
            />
          </div>
        </div>
      )}
      <Link href="/squads" className="mt-auto pt-2 text-[9px] font-bold uppercase text-[#f5b942]">
        Open Squad ›
      </Link>
    </div>
  );
}
