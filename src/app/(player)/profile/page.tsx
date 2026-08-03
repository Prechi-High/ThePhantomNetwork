"use client";

import { useEffect, useState } from "react";
import {
  EmblemAvatar,
  HeroFocus,
  ListRow,
  PageShell,
  PrimaryCTA,
  SectionLabel,
  StatPill,
} from "@/components/design-system";
import { ScreenState } from "@/components/ui/ScreenState";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { CURRENCY } from "@/lib/brand/terminology";
import { authNetwork } from "@/lib/network";
import { WalletDeposit } from "@/components/profile/WalletDeposit";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    username?: string;
    avatar_url?: string;
    wallet_balance_cents?: number;
    level?: number;
  } | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    authNetwork.getProfile().then((res) => {
      if (!res.ok) {
        setError("Failed to load profile");
        return;
      }
      const p = (res.data as { profile?: typeof profile }).profile ?? null;
      setProfile(p);
      setUsernameEdit(p?.username ?? "");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <ScreenState variant="loading" />
      </PageShell>
    );
  }

  if (error || !profile) {
    return (
      <PageShell>
        <ScreenState variant="error" message={error ?? "Profile missing"} action={<PrimaryCTA onClick={load}>Retry</PrimaryCTA>} />
      </PageShell>
    );
  }

  const balance = ((profile.wallet_balance_cents ?? 0) / 100).toFixed(2);

  return (
    <PageShell className="space-y-6">
      <HeroFocus
        eyebrow="Identity"
        title={profile.username ?? "Player"}
        subtitle="Who am I becoming?"
      >
        <div className="mt-4 flex justify-center">
          <EmblemAvatar
            src={profile.avatar_url}
            alt={profile.username ?? "Player"}
            size="lg"
          />
        </div>
      </HeroFocus>

      <div className="grid grid-cols-2 gap-2">
        <StatPill label={CURRENCY.wallet} value={`$${balance}`} accent="emerald" />
        <StatPill label="Level" value={profile.level ?? 1} accent="gold" />
      </div>

      <section className="space-y-2">
        <SectionLabel>Wallet</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setDepositOpen(true)}>Deposit</Button>
          <Button variant="secondary" onClick={() => setWithdrawOpen(true)}>
            Withdraw
          </Button>
        </div>
        <p className="text-[10px] text-legacy-muted">
          Money never buys Legacy Influence.
        </p>
      </section>

      <section className="space-y-2">
        <SectionLabel>Account</SectionLabel>
        <ListRow title="Edit profile" subtitle="Username & avatar" onClick={() => setEditOpen(true)} />
        <ListRow title="Session history" subtitle="Past arenas" href="/profile/sessions" />
        <ListRow title="Settings" subtitle="Audio, notifications, legal" href="/profile/settings" />
        <ListRow title="Legacy" subtitle="Kata & Influence" href="/legacy" />
      </section>

      <BottomSheet open={depositOpen} onOpenChange={setDepositOpen} title="Deposit">
        <WalletDeposit
          onSuccess={() => {
            load();
            setDepositOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet open={withdrawOpen} onOpenChange={setWithdrawOpen} title="Withdraw">
        <p className="mb-4 text-sm text-legacy-muted">
          Withdrawals follow governance checks. Available balance: ${balance}
        </p>
        <Button className="w-full" variant="secondary" onClick={() => setWithdrawOpen(false)}>
          Close
        </Button>
      </BottomSheet>

      <BottomSheet open={editOpen} onOpenChange={setEditOpen} title="Edit profile">
        <input
          value={usernameEdit}
          onChange={(e) => setUsernameEdit(e.target.value)}
          className="mb-3 w-full rounded-xl border border-legacy-divider bg-legacy-surface px-4 py-3 text-white"
          placeholder="Username"
        />
        <p className="mb-3 text-xs text-legacy-muted">Avatar changes use onboarding avatars for now.</p>
        <Button className="w-full" onClick={() => setEditOpen(false)}>
          Done
        </Button>
      </BottomSheet>
    </PageShell>
  );
}
