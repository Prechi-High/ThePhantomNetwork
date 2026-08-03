"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ListRow } from "@/components/design-system";
import { PlayerPageHeader } from "@/components/layout/PlayerPageHeader";

export default function CreatorPage() {
  return (
    <div className="space-y-6 pb-8">
      <PlayerPageHeader username="Creator" />
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Creator Hub</h1>
        <p className="mt-2 text-sm text-legacy-muted">
          Record gameplay, share externally, and grow Legacy Influence through content.
        </p>
      </div>
      <Button className="w-full">Record session replay</Button>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-legacy-muted">Share & grow</h2>
        <ListRow title="Download clip" subtitle="Watermarked export for social" />
        <ListRow title="Creator analytics" subtitle="Strategist rank required" />
        <ListRow title="Community feed" subtitle="In-app publishing for Strategists" href="/community" />
      </section>
      <p className="text-xs text-legacy-muted">
        Everyone can record and share externally. In-app feed unlocks at Strategist milestone.
      </p>
      <Link href="/social" className="text-sm text-legacy-blue hover:underline">Legacy social feed →</Link>
    </div>
  );
}
