import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { squadId, inviteeId } = await request.json();
  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("squad_members")
    .select("role")
    .eq("squad_id", squadId)
    .eq("user_id", user!.id)
    .single();

  if (!membership || membership.role !== "leader") {
    return NextResponse.json({ error: "Not squad leader" }, { status: 403 });
  }

  const { data: invite, error: inviteError } = await admin
    .from("squad_invites")
    .insert({
      squad_id: squadId,
      inviter_id: user!.id,
      invitee_id: inviteeId,
    })
    .select()
    .single();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  return NextResponse.json({ invite });
}
