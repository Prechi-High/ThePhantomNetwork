import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { amountCents } = await request.json();
  if (!amountCents || amountCents < 100) {
    return NextResponse.json({ error: "Minimum deposit $1.00" }, { status: 400 });
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: { userId: user!.id },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
