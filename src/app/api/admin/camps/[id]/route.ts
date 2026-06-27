import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.referral_code) updates.referral_code = body.referral_code;
  if (body.camp_switch_level != null) updates.camp_switch_level = body.camp_switch_level;
  if (body.revenue_share_pct != null) updates.revenue_share_pct = body.revenue_share_pct;
  if (body.is_default != null) updates.is_default = body.is_default;

  if (body.owner_id !== undefined) {
    updates.owner_id = body.owner_id;
    if (body.owner_id) {
      await admin
        .from("profiles")
        .update({ role: "camp_owner", camp_id: id })
        .eq("id", body.owner_id);
    }
  }

  const { data, error: updateError } = await admin
    .from("camps")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ camp: data });
}
