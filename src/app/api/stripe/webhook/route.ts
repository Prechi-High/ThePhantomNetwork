import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.userId;
    const amount = paymentIntent.amount;

    if (userId) {
      const admin = createAdminClient();
      const idempotencyKey = `stripe_${paymentIntent.id}`;

      const { data: existing } = await admin
        .from("wallet_transactions")
        .select("id")
        .eq("idempotency_key", idempotencyKey)
        .single();

      if (!existing) {
        const { data: profile } = await admin
          .from("profiles")
          .select("wallet_balance_cents")
          .eq("id", userId)
          .single();

        const newBalance = (profile?.wallet_balance_cents ?? 0) + amount;
        await admin.from("profiles").update({ wallet_balance_cents: newBalance }).eq("id", userId);
        await admin.from("wallet_transactions").insert({
          user_id: userId,
          type: "deposit",
          amount_cents: amount,
          balance_after_cents: newBalance,
          stripe_payment_intent_id: paymentIntent.id,
          idempotency_key: idempotencyKey,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
