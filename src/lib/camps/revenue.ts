import { createAdminClient } from "@/lib/supabase/admin";

export async function creditCampRevenueShare(
  userId: string,
  sessionId: string,
  entryFeeCents: number
) {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("camp_id")
    .eq("id", userId)
    .single();

  if (!profile?.camp_id) return;

  const { data: camp } = await admin
    .from("camps")
    .select("id, wallet_balance_cents, revenue_share_pct, owner_id")
    .eq("id", profile.camp_id)
    .single();

  if (!camp?.owner_id) return;

  const sharePct = Number(camp.revenue_share_pct ?? 5);
  const shareCents = Math.round((entryFeeCents * sharePct) / 100);
  if (shareCents <= 0) return;

  const newBalance = (camp.wallet_balance_cents ?? 0) + shareCents;

  await admin
    .from("camps")
    .update({ wallet_balance_cents: newBalance })
    .eq("id", camp.id);

  await admin.from("camp_revenue_events").insert({
    camp_id: camp.id,
    session_id: sessionId,
    user_id: userId,
    amount_cents: shareCents,
    event_type: "entry_fee_share",
  });
}
