"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, Flame, MessageCircle, Share2 } from "lucide-react";
import { useNotifications } from "@/components/ui/NotificationProvider";
import { motion } from "framer-motion";

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
        icon={<Heart size={32} />}
        count={localLikes}
        onClick={handleLike}
        active={isLiked}
        label="Like"
      />
      <ActionButton
        icon={<Flame size={32} />}
        count={localBoosts}
        onClick={handleBoost}
        isAnimating={isBoosting}
        label="Boost"
      />
      <ActionButton
        icon={<MessageCircle size={32} />}
        count={commentCount}
        onClick={onComment}
        label="Comment"
      />
      <ActionButton
        icon={<Share2 size={32} />}
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
  icon: React.ReactNode;
  count: number;
  onClick?: () => void;
  active?: boolean;
  isAnimating?: boolean;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="flex flex-col items-center gap-1 p-2 rounded-full transition-all duration-300"
    >
      <motion.div
        animate={
          active
            ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              }
            : isAnimating
            ? {
                rotate: [0, 10, -10, 0],
                transition: { duration: 0.6, repeat: Infinity }
              }
            : {}
        }
        className={cn(
          "transition-all duration-300",
          active
            ? "text-phantom-purple-bright drop-shadow-[0_0_10px_var(--color-phantom-purple-glow)]"
            : "text-phantom-muted hover:text-phantom-text"
        )}
      >
        {icon}
      </motion.div>
      <span className={cn(
        "text-xs font-semibold",
        active
          ? "text-phantom-purple-bright"
          : "text-phantom-muted"
      )}
      >
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
      {label && (
        <span className="text-[10px] text-phantom-muted/70">
          {label}
        </span>
      )}
    </motion.button>
  );
}
