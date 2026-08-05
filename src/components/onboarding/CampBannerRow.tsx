"use client";

import { cn } from "@/lib/utils";
import { FACTION_CAMPS, type FactionCamp } from "@/lib/camps/factions";

interface CampBannerRowProps {
  selectedSlug?: string;
  onSelect?: (faction: FactionCamp) => void;
  compact?: boolean;
  className?: string;
}

export function CampBannerRow({
  selectedSlug,
  onSelect,
  compact = false,
  className,
}: CampBannerRowProps) {
  return (
    <div className={cn("flex items-end justify-center gap-1", className)}>
      {FACTION_CAMPS.map((camp) => {
        const selected = selectedSlug === camp.slug;
        const isCenter = camp.defaultSelected;
        return (
          <button
            key={camp.slug}
            type="button"
            onClick={() => onSelect?.(camp)}
            disabled={!onSelect}
            className={cn(
              "relative flex flex-col items-center transition-all duration-300",
              isCenter ? "z-10" : "z-0",
              onSelect && "cursor-pointer",
              compact ? (isCenter ? "w-[18%]" : "w-[14%]") : isCenter ? "w-[22%]" : "w-[16%]"
            )}
          >
            <div
              className={cn(
                "flex w-full flex-col items-center rounded-t-lg border-x border-t backdrop-blur-sm transition-all",
                selected
                  ? "scale-105 border-[#f5b942] shadow-[0_0_20px_rgba(245,185,66,0.4)]"
                  : "border-white/10 opacity-80",
                compact ? "py-1.5" : "py-2"
              )}
              style={{
                background: `linear-gradient(180deg, ${camp.accentGlow} 0%, rgba(0,0,0,0.85) 100%)`,
                borderColor: selected ? camp.accent : undefined,
              }}
            >
              <span className={cn("leading-none", compact ? "text-lg" : "text-2xl")}>{camp.emoji}</span>
              {!compact && (
                <span
                  className="mt-1 text-[7px] font-bold uppercase tracking-wide"
                  style={{ color: camp.accent }}
                >
                  {camp.name}
                </span>
              )}
            </div>
            {selected && (
              <div
                className="h-0.5 w-full"
                style={{ backgroundColor: camp.accent, boxShadow: `0 0 8px ${camp.accentGlow}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
