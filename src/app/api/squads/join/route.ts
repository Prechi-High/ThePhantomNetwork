import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { inviteId } = await request.json();
  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("squad_invites")
    .select("*, squads(*)")
    .eq("id", inviteId)
    .eq("invitee_id", user!.id)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Handle the squads relationship - it can be an array or object depending on Supabase query
  const squadData = Array.isArray(invite.squads) 
    ? invite.squads[0] 
    : invite.squads;

  if (!squadData || !squadData.id) {
    return NextResponse.json({ error: "Squad data invalid" }, { status: 400 });
  }

  const squad = squadData as { id: string; member_count: number };
  if (squad.member_count >= 5) {
    return NextResponse.json({ error: "Squad is full" }, { status: 400 });
  }

  await admin.from("squad_members").insert({
    squad_id: squad.id,
    user_id: user!.id,
    role: "member",
  });

  await admin
    .from("squads")
    .update({ member_count: squad.member_count + 1 })
    .eq("id", squad.id);

  await admin
    .from("squad_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId);

  return NextResponse.json({ success: true });
}
}

export async function DELETE() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();
  await admin.from("squad_members").delete().eq("user_id", user!.id);

  return NextResponse.json({ success: true });
}
