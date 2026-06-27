import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishLiveFeed } from "@/lib/api/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session || session.status !== "open") {
    return NextResponse.json({ error: "Session not open for registration" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("wallet_balance_cents")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.wallet_balance_cents < session.entry_fee_cents) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("session_registrations")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_id", user!.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already registered" }, { status: 400 });
  }

  const { data: squadMember } = await admin
    .from("squad_members")
    .select("squad_id")
    .eq("user_id", user!.id)
    .single();

  const newBalance = profile.wallet_balance_cents - session.entry_fee_cents;

  await admin
    .from("profiles")
    .update({ wallet_balance_cents: newBalance })
    .eq("id", user!.id);

  await admin.from("wallet_transactions").insert({
    user_id: user!.id,
    type: "entry_fee",
    amount_cents: -session.entry_fee_cents,
    balance_after_cents: newBalance,
    reference_type: "session",
    reference_id: sessionId,
  });

  await admin.from("session_registrations").insert({
    session_id: sessionId,
    user_id: user!.id,
    squad_id: squadMember?.squad_id ?? null,
    entry_paid_cents: session.entry_fee_cents,
  });

  const newCount = session.registered_count + 1;
  const newPool = newCount * session.entry_fee_cents;

  await admin
    .from("sessions")
    .update({ registered_count: newCount, total_pool_cents: newPool })
    .eq("id", sessionId);

  const { data: userProfile } = await admin
    .from("profiles")
    .select("username")
    .eq("id", user!.id)
    .single();

  await publishLiveFeed(
    "session_join",
    `${userProfile?.username ?? "A player"} joined ${session.title}`,
    { sessionId, userId: user!.id }
  );

  return NextResponse.json({ success: true, poolCents: newPool });
}
