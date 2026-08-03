"use client";

import Link from "next/link";
import { ListRow } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";
import { interactionController } from "@/lib/motion/InteractionController";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PlayerPageHeader />
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
      <section className="space-y-2">
        <ListRow
          title="Sound & haptics"
          subtitle="Master volume and feedback"
          onClick={() => interactionController.setMute(false)}
        />
        <ListRow title="Notification preferences" subtitle="Per-category alerts" href="/notifications" />
        <ListRow title="Account" subtitle="Username and avatar" href="/profile" />
        <ListRow title="Legal" subtitle="Terms and privacy" />
      </section>
      <Link href="/profile" className="text-sm text-legacy-muted hover:text-white">← Back to profile</Link>
    </div>
  );
}
