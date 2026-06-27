import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance_cents")
    .eq("id", user!.id)
    .single();

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    balanceCents: profile?.wallet_balance_cents ?? 0,
    transactions: transactions ?? [],
  });
}
