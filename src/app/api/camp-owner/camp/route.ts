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
    .select("*")
    .eq("id", camp!.id)
    .single();

  const { count: memberCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("camp_id", camp!.id);

  const { data: recentSessions } = await admin
    .from("session_registrations")
    .select("session_id, sessions(title, status, starts_at)")
    .in(
      "user_id",
      (
        await admin.from("profiles").select("id").eq("camp_id", camp!.id)
      ).data?.map((p) => p.id) ?? []
    )
    .order("joined_at", { ascending: false })
    .limit(10);

  const { data: revenueEvents } = await admin
    .from("camp_revenue_events")
    .select("amount_cents")
    .eq("camp_id", camp!.id);

  const totalRevenue = (revenueEvents ?? []).reduce((s, e) => s + e.amount_cents, 0);

  return NextResponse.json({
    camp: campData,
    stats: {
      memberCount: memberCount ?? campData?.member_count ?? 0,
      totalRevenueCents: totalRevenue,
      walletBalanceCents: campData?.wallet_balance_cents ?? 0,
      recentParticipation: recentSessions?.length ?? 0,
    },
  });
}
