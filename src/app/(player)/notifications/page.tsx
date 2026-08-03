"use client";

import { ListRow } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";

const CATEGORIES = [
  "Session",
  "Squad",
  "Camp",
  "Legacy",
  "Creator",
  "Wallet",
  "Social",
  "System",
  "War",
] as const;

export default function NotificationsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PlayerPageHeader showNotifications={false} />
      <h1 className="font-display text-2xl font-bold text-white">Notifications</h1>
      <p className="text-sm text-legacy-muted">Deep links open the relevant screen directly.</p>
      <section className="space-y-2">
        {CATEGORIES.map((cat) => (
          <ListRow key={cat} title={cat} subtitle="No new alerts" />
        ))}
      </section>
    </div>
  );
}
