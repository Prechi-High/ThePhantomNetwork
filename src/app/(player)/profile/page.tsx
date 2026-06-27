"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { AVATARS } from "@/types/gameplay";
import { WalletDeposit } from "@/components/profile/WalletDeposit";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  const loadProfile = () => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) return <p className="text-phantom-muted">Loading...</p>;

  const avatar = AVATARS.find((a) => a.id === profile.avatar_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{avatar?.emoji ?? "🌑"}</span>
        <div>
          <h1 className="font-display text-2xl font-bold">{profile.username as string}</h1>
          <p className="text-phantom-muted">Level {profile.level as number}</p>
        </div>
      </div>

      <Card glow>
        <p className="text-sm text-phantom-muted">Wallet</p>
        <p className="font-mono text-3xl font-bold text-phantom-gold">
          ${((profile.wallet_balance_cents as number) / 100).toFixed(2)}
        </p>
      </Card>

      <WalletDeposit onSuccess={loadProfile} />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/profile/sessions">
          <Card className="text-center hover:border-phantom-gold/50">
            <p className="text-sm">Session History</p>
          </Card>
        </Link>
        <Card className="text-center">
          <p className="text-sm">Prestige: {profile.prestige_score as number}</p>
        </Card>
      </div>
    </div>
  );
}
