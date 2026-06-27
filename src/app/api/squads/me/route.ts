import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("squad_members")
    .select("*, squads(*)")
    .eq("user_id", user!.id)
    .single();

  if (!membership) {
    return NextResponse.json({ squad: null, members: [] });
  }

  const { data: members } = await admin
    .from("squad_members")
    .select("*, profiles(id, username, avatar_id, level)")
    .eq("squad_id", membership.squad_id);

  return NextResponse.json({
    squad: membership.squads,
    membership,
    members: members ?? [],
  });
}
