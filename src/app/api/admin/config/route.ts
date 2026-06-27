import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbError } = await admin
    .from("platform_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.default_platform_fee_pct != null) {
    updates.default_platform_fee_pct = body.default_platform_fee_pct;
  }
  if (body.default_entry_fee_cents != null) {
    updates.default_entry_fee_cents = body.default_entry_fee_cents;
  }
  if (body.default_camp_revenue_share_pct != null) {
    updates.default_camp_revenue_share_pct = body.default_camp_revenue_share_pct;
  }
  if (body.camp_switch_level != null) {
    updates.camp_switch_level = body.camp_switch_level;
  }

  const { data, error: updateError } = await admin
    .from("platform_config")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
