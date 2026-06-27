import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();

  const { data: subSessions } = await admin
    .from("sub_sessions")
    .select("id")
    .eq("session_id", sessionId);

  if (!subSessions?.length) {
    return NextResponse.json({ subSessionId: null, status: "not_created" });
  }

  for (const sub of subSessions) {
    const { data: player } = await admin
      .from("sub_session_players")
      .select("id")
      .eq("sub_session_id", sub.id)
      .eq("user_id", user!.id)
      .single();

    if (player) {
      return NextResponse.json({ subSessionId: sub.id, status: "assigned" });
    }
  }

  return NextResponse.json({ subSessionId: null, status: "not_registered" });
}
