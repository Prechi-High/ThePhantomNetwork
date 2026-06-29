"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatedSprite } from "@/components/sprites/AnimatedSprite";
import { AssetRegistry } from "@/lib/assets/AssetRegistry";
import type { ProfileSpriteState } from "@/lib/assets/types";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AnimatedAvatarProps {
  /** Avatar image URL (optional) */
  avatarUrl?: string;
  /** Player states to determine border (highest priority wins) */
  states?: ProfileSpriteState[];
  /** Size preset */
  size?: AvatarSize;
  /** Online indicator */
  online?: boolean;
  /** Optional token counter */
  tokens?: number;
  /** Optional badge text */
  badge?: string;
  /** Fallback color for avatar */
  fallbackColor?: string;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

const borderSizeMap: Record<AvatarSize, number> = {
  xs: 40,
  sm: 56,
  md: 72,
  lg: 104,
  xl: 136,
};

export function AnimatedAvatar({
  avatarUrl,
  states = ["ACTIVE"],
  size = "md",
  online = false,
  tokens,
  badge,
  fallbackColor = "#6b7280",
  className,
}: AnimatedAvatarProps) {
  const sizePx = sizeMap[size];
  const borderSizePx = borderSizeMap[size];

  const activeState = useMemo(() => {
    let highestPriority = -1;
    let active: ProfileSpriteState = "DEFAULT";

    for (const state of states) {
      const config = AssetRegistry.getProfileSprite(state);
      if (config && config.priority > highestPriority) {
        highestPriority = config.priority;
        active = state;
      }
    }
    return active;
  }, [states]);

  const spriteConfig = AssetRegistry.getProfileSprite(activeState);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Animated Border */}
      {spriteConfig && spriteConfig.spritePath && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedSprite
            config={spriteConfig}
            width={borderSizePx}
            height={borderSizePx}
          />
        </div>
      )}

      {/* Fallback border if no sprite */}
      {(!spriteConfig || !spriteConfig.spritePath) && (
        <div
          className="absolute rounded-full border-2 border-phantom-border"
          style={{
            width: borderSizePx,
            height: borderSizePx,
          }}
        />
      )}

      {/* Avatar Image / Fallback */}
      <div
        className="relative z-10 rounded-full overflow-hidden"
        style={{ width: sizePx, height: sizePx }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: fallbackColor }}
          >
            ?
          </div>
        )}
      </div>

      {/* Online Indicator */}
      {online && (
        <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-phantom-bg z-20" />
      )}

      {/* Token Badge */}
      {typeof tokens === "number" && (
        <div className="absolute -top-1 -right-1 z-20 bg-phantom-gold text-phantom-bg text-xs font-bold rounded-full px-1.5 py-0.5">
          {tokens}
        </div>
      )}

      {/* Custom Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-20 bg-phantom-danger text-white text-xs font-bold rounded-full px-1.5 py-0.5">
          {badge}
        </div>
      )}
    </div>
  );
}
