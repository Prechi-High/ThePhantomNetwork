import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();
  const { data: rivalries } = await admin
    .from("rivalries")
    .select("*")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
    .order("intensity", { ascending: false });

  const enriched = [];
  for (const r of rivalries ?? []) {
    const rivalId = r.user_a === user!.id ? r.user_b : r.user_a;
    const { data: profile } = await admin
      .from("profiles")
      .select("username, avatar_id")
      .eq("id", rivalId)
      .single();
    enriched.push({ ...r, rival: profile });
  }

  return NextResponse.json({ rivalries: enriched });
}
