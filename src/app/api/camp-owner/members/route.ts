import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCampOwner } from "@/lib/api/role-helpers";

export async function GET() {
  const result = await requireCampOwner();
  if (result.error) return result.error;
  const { camp } = result;

  const admin = createAdminClient();

  const { data: members } = await admin
    .from("profiles")
    .select("id, username, avatar_id, level, prestige_score, created_at")
    .eq("camp_id", camp!.id)
    .order("prestige_score", { ascending: false })
    .limit(100);

  const memberIds = (members ?? []).map((m) => m.id);

  const { data: registrations } = await admin
    .from("session_registrations")
    .select("user_id")
    .in("user_id", memberIds.length ? memberIds : ["00000000-0000-0000-0000-000000000000"]);

  const participationMap = new Map<string, number>();
  for (const reg of registrations ?? []) {
    participationMap.set(reg.user_id, (participationMap.get(reg.user_id) ?? 0) + 1);
  }

  const enriched = (members ?? []).map((m) => ({
    ...m,
    sessionsPlayed: participationMap.get(m.id) ?? 0,
  }));

  return NextResponse.json({ members: enriched });
}
