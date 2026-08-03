"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { EmblemAvatar } from "@/components/design-system";
import { APP_NAME } from "@/lib/brand/terminology";

interface PlayerPageHeaderProps {
  avatarUrl?: string | null;
  username?: string;
  showNotifications?: boolean;
}

export function PlayerPageHeader({ avatarUrl, username = "Player", showNotifications = true }: PlayerPageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <Link href="/profile" className="flex items-center gap-3">
        <EmblemAvatar src={avatarUrl} alt={username} size="sm" />
        <div>
          <p className="text-[10px] uppercase tracking-wide text-legacy-muted">{APP_NAME}</p>
          <p className="font-semibold text-white">{username}</p>
        </div>
      </Link>
      {showNotifications && (
        <Link
          href="/notifications"
          className="rounded-xl border border-legacy-border p-2 text-legacy-muted hover:text-legacy-gold"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>
      )}
    </header>
  );
}
