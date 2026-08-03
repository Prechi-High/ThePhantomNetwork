"use client";

import { ListRow, PageShell, HeroFocus, SectionLabel } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";

const CATEGORIES: { title: string; href: string; subtitle: string }[] = [
  { title: "Session", href: "/sessions", subtitle: "Arenas starting & results" },
  { title: "Squad", href: "/squads", subtitle: "Invites & projects" },
  { title: "Camp", href: "/camps", subtitle: "Treasury & wars" },
  { title: "Legacy", href: "/legacy", subtitle: "Promotions & Influence" },
  { title: "Creator", href: "/creator", subtitle: "Clips & referrals" },
  { title: "Wallet", href: "/profile", subtitle: "Deposits & withdrawals" },
  { title: "Social", href: "/creator", subtitle: "Follows & mentions" },
  { title: "System", href: "/profile/settings", subtitle: "Account alerts" },
  { title: "War", href: "/world", subtitle: "Legacy War updates" },
];

export default function NotificationsPage() {
  return (
    <PageShell className="space-y-6">
      <PlayerPageHeader showNotifications={false} />
      <HeroFocus
        eyebrow="Alerts"
        title="Notifications"
        subtitle="Every alert deep-links to its screen."
      />
      <section className="space-y-2">
        <SectionLabel>Categories</SectionLabel>
        {CATEGORIES.map((c) => (
          <ListRow key={c.title} title={c.title} subtitle={c.subtitle} href={c.href} />
        ))}
      </section>
    </PageShell>
  );
}
