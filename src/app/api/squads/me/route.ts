import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("squad_members")
    .select("*, squads(*)")
    .eq("user_id", user!.id)
    .single();

  if (membershipError || !membership) {
    return NextResponse.json({ squad: null, members: [] });
  }

  // Handle the squads relationship - it can be an array or object depending on Supabase query
  const squadData = Array.isArray(membership.squads) 
    ? membership.squads[0] 
    : membership.squads;

  if (!squadData) {
    return NextResponse.json({ squad: null, members: [] });
  }

  const { data: members, error: membersError } = await admin
    .from("squad_members")
    .select("*, profiles(id, username, avatar_id, level)")
    .eq("squad_id", membership.squad_id);

  if (membersError) {
    return NextResponse.json({ squad: squadData, members: [] });
  }

  return NextResponse.json({
    squad: squadData,
    members: members || [],
  });
}
