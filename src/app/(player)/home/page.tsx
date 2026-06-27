import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import type { Database } from "@/types/database";
import { UpcomingSessions } from "@/components/session/UpcomingSessions";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const p = profile as ProfileRow | null;
  let campName = "Phantom Camp";
  if (p?.camp_id) {
    const { data: camp } = await supabase
      .from("camps")
      .select("name")
      .eq("id", p.camp_id)
      .single();
    campName = (camp as { name: string } | null)?.name ?? campName;
  }

  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("*")
    .in("status", ["open", "locked"])
    .order("starts_at", { ascending: true })
    .limit(3);

  const sessions = (sessionsData ?? []) as SessionRow[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">
          Welcome, <span className="text-phantom-gold">{p?.username}</span>
        </h1>
        <p className="text-phantom-muted">{campName}</p>
      </header>

      <Card glow>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-phantom-muted">Wallet Balance</p>
            <p className="font-mono text-2xl font-bold text-phantom-gold">
              ${((p?.wallet_balance_cents ?? 0) / 100).toFixed(2)}
            </p>
          </div>
          <Link href="/profile" className="text-sm text-phantom-gold hover:underline">
            Add Funds
          </Link>
        </div>
      </Card>

      <UpcomingSessions
        initialSessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          starts_at: s.starts_at,
          registration_closes_at: s.registration_closes_at,
        }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/rivals">
          <Card className="text-center hover:border-phantom-danger/50">
            <span className="text-2xl">⚔️</span>
            <p className="mt-1 text-sm">Rivals</p>
          </Card>
        </Link>
        <Link href="/social">
          <Card className="text-center hover:border-phantom-gold/50">
            <span className="text-2xl">👥</span>
            <p className="mt-1 text-sm">Social</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
