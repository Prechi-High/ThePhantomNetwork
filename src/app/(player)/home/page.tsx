import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Database } from "@/types/database";

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

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Upcoming Sessions</h2>
        <div className="space-y-3">
          {sessions.length ? (
            sessions.map((session) => (
              <Link key={session.id} href={`/sessions/${session.id}`}>
                <Card className="transition-colors hover:border-phantom-gold/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-xs text-phantom-muted">
                        {new Date(session.starts_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge>{session.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <p className="text-phantom-muted">No sessions scheduled. Check back soon.</p>
            </Card>
          )}
        </div>
      </section>

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
