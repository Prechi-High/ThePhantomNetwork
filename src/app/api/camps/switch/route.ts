import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { campId } = await request.json();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("level, camp_id")
    .eq("id", user!.id)
    .single();

  const { data: targetCamp } = await admin
    .from("camps")
    .select("camp_switch_level")
    .eq("id", campId)
    .single();

  if (!profile || !targetCamp) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: configCamp } = await admin
    .from("camps")
    .select("camp_switch_level")
    .eq("id", profile.camp_id!)
    .single();

  const requiredLevel = configCamp?.camp_switch_level ?? 5;
  if (profile.level < requiredLevel) {
    return NextResponse.json(
      { error: `Level ${requiredLevel} required to switch camps` },
      { status: 403 }
    );
  }

  await admin.from("profiles").update({ camp_id: campId }).eq("id", user!.id);

  return NextResponse.json({ success: true });
}
