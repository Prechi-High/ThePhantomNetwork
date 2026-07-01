"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/ui/NotificationProvider";

interface TikTokActionRailProps {
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBoost?: () => void;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  boostCount?: number;
  className?: string;
}

export function TikTokActionRail({
  onLike,
  onComment,
  onShare,
  onBoost,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  boostCount = 0,
  className,
}: TikTokActionRailProps) {
  const [localLikes, setLocalLikes] = useState(likeCount);
  const [localBoosts, setLocalBoosts] = useState(boostCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const { addNotification } = useNotifications();

  const handleLike = () => {
    if (isLiked) {
      setLocalLikes((prev) => prev - 1);
    } else {
      setLocalLikes((prev) => prev + 1);
      addNotification({
        type: "like",
        title: "Liked!",
        message: "You liked this spin!",
      });
    }
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleBoost = () => {
    setIsBoosting(true);
    setTimeout(() => {
      setIsBoosting(false);
      setLocalBoosts((prev) => prev + 1);
      addNotification({
        type: "success",
        title: "Boost Active!",
        message: "Your squad got a boost!",
      });
    }, 1000);
    onBoost?.();
  };

  return (
    <div className={cn(
      "absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-40",
      className
    )}>
      <ActionButton
        icon="❤️"
        count={localLikes}
        onClick={handleLike}
        active={isLiked}
        label="Like"
      />
      <ActionButton
        icon="🔥"
        count={localBoosts}
        onClick={handleBoost}
        isAnimating={isBoosting}
        label="Boost"
      />
      <ActionButton
        icon="💬"
        count={commentCount}
        onClick={onComment}
        label="Comment"
      />
      <ActionButton
        icon="🔗"
        count={shareCount}
        onClick={onShare}
        label="Share"
      />
    </div>
  );
}

function ActionButton({
  icon,
  count,
  onClick,
  active,
  isAnimating,
  label,
}: {
  icon: string;
  count: number;
  onClick?: () => void;
  active?: boolean;
  isAnimating?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-full transition-all duration-200 hover:scale-110"
    >
      <div className={cn(
        "text-3xl transition-all duration-200",
        active ? "scale-110 text-shadow-lg" : "",
        isAnimating ? "animate-pulse" : ""
      )}
        style={
          active
            ? { textShadow: "0 0 10px rgba(212, 168, 83, 0.6)" }
            : undefined
        }
      >
        {icon}
      </div>
      <span className={cn(
        "text-xs font-semibold",
        active ? "text-phantom-gold" : "text-phantom-muted"
      )}
      >
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
      {label && (
        <span className="text-[10px] text-phantom-muted/70">
          {label}
        </span>
      )}
    </button>
  );
}
