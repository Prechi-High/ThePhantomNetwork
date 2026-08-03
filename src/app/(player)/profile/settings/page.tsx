"use client";

import Link from "next/link";
import { ListRow, PageShell, HeroFocus } from "@/components/design-system";
import { interactionController } from "@/lib/motion/InteractionController";

export default function SettingsPage() {
  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow="Settings"
        title="Preferences"
        subtitle="Stay in control without leaving the flow."
      />
      <section className="space-y-2">
        <ListRow
          title="Sound & haptics"
          subtitle="Unmute master feedback"
          onClick={() => interactionController.setMute(false)}
        />
        <ListRow
          title="Mute all"
          subtitle="Silence audio + haptics"
          onClick={() => interactionController.setMute(true)}
        />
        <ListRow title="Notifications" subtitle="Per-category alerts" href="/notifications" />
        <ListRow title="Account" subtitle="Profile & wallet" href="/profile" />
        <ListRow title="Legal" subtitle="Terms and privacy" />
      </section>
      <Link href="/profile" className="block text-center text-sm text-legacy-muted hover:text-white">
        ← Profile
      </Link>
    </PageShell>
  );
}
