"use client";

import Link from "next/link";
import { Bell, Mail, ScanLine, Shield, Pencil } from "lucide-react";
import { EmblemAvatar } from "@/components/design-system";
import { CURRENT_SEASON } from "@/lib/brand/terminology";

interface HomeProfileHeaderProps {
  username: string;
  avatarUrl?: string | null;
  level?: number;
  xp?: number;
  xpMax?: number;
}

export function HomeProfileHeader({
  username,
  avatarUrl,
  level = 1,
  xp = 1200,
  xpMax = 2000,
}: HomeProfileHeaderProps) {
  const pct = Math.min(100, Math.round((xp / xpMax) * 100));

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-3">
          <EmblemAvatar src={avatarUrl} alt={username} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate font-bold text-white">{username}</p>
              <Pencil className="h-3 w-3 shrink-0 text-white/30" />
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-[#f5b942]/40 px-2 py-0.5">
              <Shield className="h-3 w-3 text-[#f5b942]" />
              <span className="text-[9px] font-bold uppercase text-[#f5b942]">Recruit</span>
            </div>
            <p className="mt-0.5 text-[10px] text-white/50">Level {level}</p>
          </div>
        </Link>

        <div className="shrink-0 text-center">
          <Shield className="mx-auto h-4 w-4 text-[#f5b942]" />
          <p className="text-[9px] font-bold uppercase text-[#f5b942]">Season {CURRENT_SEASON}</p>
          <p className="text-[9px] text-legacy-amber">14 Days Left</p>
        </div>

        <div className="flex shrink-0 gap-1">
          {[Bell, Mail, ScanLine].map((Icon, i) => (
            <Link
              key={i}
              href={i === 0 ? "/notifications" : "/profile"}
              className="rounded-lg border border-white/10 bg-black/40 p-2 text-white/50 hover:text-[#f5b942]"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[10px] text-white/40">
          <span>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-legacy-blue to-[#f5b942]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
