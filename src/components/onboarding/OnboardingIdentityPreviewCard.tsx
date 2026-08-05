"use client";

import { AVATARS } from "@/types/gameplay";
import { cn } from "@/lib/utils";
import { Shield, Star, Swords, Crown } from "lucide-react";

interface OnboardingIdentityPreviewCardProps {
  username: string;
  avatarId: string;
}

export function OnboardingIdentityPreviewCard({
  username,
  avatarId,
}: OnboardingIdentityPreviewCardProps) {
  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  return (
    <div className="rounded-xl border border-[#f5b942]/50 bg-black/70 p-4 shadow-[0_0_24px_rgba(245,185,66,0.15)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f5b942]/60 bg-black/80 text-3xl">
            {avatar.emoji}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-white">{username || "YourName"}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#f5b942]/40 px-2 py-0.5">
            <Shield className="h-3 w-3 text-[#f5b942]" />
            <span className="text-[9px] font-bold uppercase text-[#f5b942]">Recruit</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-white/40">Influence</p>
              <p className="font-bold text-[#f5b942]">0</p>
            </div>
            <div>
              <p className="text-white/40">Legacy</p>
              <p className="font-bold text-legacy-blue">BEGINNING</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdentityValueProps() {
  const items = [
    { icon: Shield, line1: "Your name.", line2: "Your legacy." },
    { icon: Swords, line1: "Compete.", line2: "Be legendary." },
    { icon: Star, line1: "Climb ranks.", line2: "Build influence." },
    { icon: Crown, line1: "Be remembered", line2: "forever." },
  ];

  return (
    <div className="grid grid-cols-4 gap-1">
      {items.map(({ icon: Icon, line1, line2 }) => (
        <div key={line1} className="flex flex-col items-center text-center">
          <Icon className="mb-1 h-4 w-4 text-[#f5b942]" />
          <p className="text-[7px] leading-tight text-white/70">{line1}</p>
          <p className="text-[7px] leading-tight text-white/50">{line2}</p>
        </div>
      ))}
    </div>
  );
}

export function AvatarCarousel({
  avatarId,
  onSelect,
}: {
  avatarId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {AVATARS.map((avatar) => {
        const selected = avatarId === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1",
              selected && "scale-105"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition-all",
                selected
                  ? "border-[#f5b942] shadow-[0_0_16px_rgba(245,185,66,0.45)]"
                  : "border-white/15 bg-black/50"
              )}
            >
              {avatar.emoji}
            </div>
            <span className="text-[9px] text-white/50">{avatar.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function generateUsernameSuggestions(base: string): string[] {
  const clean = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 14) || "Phantom";
  return [`${clean}X`, `${clean}_7`, `${clean}CP`];
}
