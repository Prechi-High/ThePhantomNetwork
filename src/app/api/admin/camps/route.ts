import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbError } = await admin
    .from("camps")
    .select("*")
    .order("name");

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ camps: data ?? [] });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const admin = createAdminClient();

  const slug = body.slug ?? slugify(body.name);
  const referralCode =
    body.referral_code ?? slug.toUpperCase().replace(/-/g, "").slice(0, 12);

  const { data, error: insertError } = await admin
    .from("camps")
    .insert({
      name: body.name,
      slug,
      referral_code: referralCode,
      owner_id: body.owner_id ?? null,
      is_default: body.is_default ?? false,
      camp_switch_level: body.camp_switch_level ?? 5,
      revenue_share_pct: body.revenue_share_pct ?? 5,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (body.owner_id) {
    await admin
      .from("profiles")
      .update({ role: "camp_owner", camp_id: data.id })
      .eq("id", body.owner_id);
  }

  return NextResponse.json({ camp: data });
}
