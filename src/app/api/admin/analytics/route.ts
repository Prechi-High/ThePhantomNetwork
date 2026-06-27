import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();

  const { data: deposits } = await admin
    .from("wallet_transactions")
    .select("amount_cents")
    .eq("type", "deposit");

  const { data: entryFees } = await admin
    .from("wallet_transactions")
    .select("amount_cents")
    .eq("type", "entry_fee");

  const { data: rewards } = await admin
    .from("wallet_transactions")
    .select("amount_cents")
    .eq("type", "reward");

  const { data: sessions } = await admin
    .from("sessions")
    .select("id, status, total_pool_cents, platform_fee_pct, registered_count");

  const totalDeposits = (deposits ?? []).reduce((s, t) => s + t.amount_cents, 0);
  const totalEntryFees = Math.abs(
    (entryFees ?? []).reduce((s, t) => s + t.amount_cents, 0)
  );
  const totalRewards = (rewards ?? []).reduce((s, t) => s + t.amount_cents, 0);

  const activeSessions = (sessions ?? []).filter((s) =>
    ["open", "locked", "active"].includes(s.status)
  ).length;

  const completedSessions = (sessions ?? []).filter(
    (s) => s.status === "completed"
  ).length;

  const totalPool = (sessions ?? []).reduce(
    (s, sess) => s + (sess.total_pool_cents ?? 0),
    0
  );

  const estimatedPlatformRevenue = (sessions ?? [])
    .filter((s) => s.status === "completed")
    .reduce(
      (s, sess) =>
        s + Math.round((sess.total_pool_cents * Number(sess.platform_fee_pct)) / 100),
      0
    );

  return NextResponse.json({
    revenue: {
      totalDepositsCents: totalDeposits,
      totalEntryFeesCents: totalEntryFees,
      totalRewardsCents: totalRewards,
      estimatedPlatformRevenueCents: estimatedPlatformRevenue,
      totalPoolCents: totalPool,
    },
    participation: {
      activeSessions,
      completedSessions,
      totalSessions: sessions?.length ?? 0,
      totalRegistrations: (sessions ?? []).reduce(
        (s, sess) => s + (sess.registered_count ?? 0),
        0
      ),
    },
  });
}
