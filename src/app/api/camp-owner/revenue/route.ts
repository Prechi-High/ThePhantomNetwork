import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCampOwner } from "@/lib/api/role-helpers";

export async function GET() {
  const result = await requireCampOwner();
  if (result.error) return result.error;
  const { camp } = result;

  const admin = createAdminClient();

  const { data: campData } = await admin
    .from("camps")
    .select("wallet_balance_cents, revenue_share_pct")
    .eq("id", camp!.id)
    .single();

  const { data: events } = await admin
    .from("camp_revenue_events")
    .select("*, sessions(title), profiles(username)")
    .eq("camp_id", camp!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const totalEarned = (events ?? []).reduce((s, e) => s + e.amount_cents, 0);

  return NextResponse.json({
    walletBalanceCents: campData?.wallet_balance_cents ?? 0,
    revenueSharePct: campData?.revenue_share_pct ?? 5,
    totalEarnedCents: totalEarned,
    events: events ?? [],
  });
}
