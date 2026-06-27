"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { AVATARS } from "@/types/gameplay";
import { WalletDeposit } from "@/components/profile/WalletDeposit";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);

  const loadProfile = () => {
    fetch("/api/profile", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        if (d.profile) {
          setUsername(d.profile.username as string);
          setAvatarId((d.profile.avatar_id as string) ?? AVATARS[0].id);
        }
      });
    fetch("/api/wallet", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, avatar_id: avatarId }),
    });
    setEditing(false);
    loadProfile();
  };

  if (!profile) return <p className="text-phantom-muted">Loading...</p>;

  const avatar = AVATARS.find((a) => a.id === profile.avatar_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{avatar?.emoji ?? "🌑"}</span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{profile.username as string}</h1>
          <p className="text-phantom-muted">Level {profile.level as number}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {editing && (
        <Card className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          />
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvatarId(a.id)}
                className={cn(
                  "rounded-lg border p-2 text-center",
                  avatarId === a.id ? "border-phantom-gold" : "border-phantom-border"
                )}
              >
                {a.emoji}
              </button>
            ))}
          </div>
          <Button onClick={saveProfile} size="sm">
            Save Profile
          </Button>
        </Card>
      )}

      <Card glow>
        <p className="text-sm text-phantom-muted">Wallet</p>
        <p className="font-mono text-3xl font-bold text-phantom-gold">
          ${((profile.wallet_balance_cents as number) / 100).toFixed(2)}
        </p>
      </Card>

      <WalletDeposit onSuccess={loadProfile} />

      <Link href="/admin/login">
        <Card className="text-center hover:border-phantom-gold/50">
          <p className="text-sm">Admin Login</p>
        </Card>
      </Link>

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

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Transactions</h2>
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx) => (
            <Card key={tx.id} className="flex justify-between text-sm">
              <div>
                <p className="capitalize">{tx.type.replace("_", " ")}</p>
                <p className="text-xs text-phantom-muted">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
              <p
                className={cn(
                  "font-mono",
                  tx.amount_cents >= 0 ? "text-phantom-gold" : "text-phantom-danger"
                )}
              >
                {tx.amount_cents >= 0 ? "+" : ""}${(tx.amount_cents / 100).toFixed(2)}
              </p>
            </Card>
          ))}
          {!transactions.length && (
            <Card>
              <p className="text-sm text-phantom-muted">No transactions yet.</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
