import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { user, error } = await requireAuth();
  if (error) return error;

  const { amountCents } = await request.json();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("wallet_balance_cents")
    .eq("id", user!.id)
    .single();

  const newBalance = (profile?.wallet_balance_cents ?? 0) + amountCents;

  await admin
    .from("profiles")
    .update({ wallet_balance_cents: newBalance })
    .eq("id", user!.id);

  await admin.from("wallet_transactions").insert({
    user_id: user!.id,
    type: "deposit",
    amount_cents: amountCents,
    balance_after_cents: newBalance,
    reference_type: "dev_credit",
  });

  return NextResponse.json({ balanceCents: newBalance });
}
