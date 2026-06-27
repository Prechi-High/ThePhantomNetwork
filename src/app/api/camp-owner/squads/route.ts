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
    .select("id")
    .eq("camp_id", camp!.id);

  const memberIds = (members ?? []).map((m) => m.id);
  if (!memberIds.length) {
    return NextResponse.json({ squads: [] });
  }

  const { data: squadMembers } = await admin
    .from("squad_members")
    .select("squad_id, squads(id, name, member_count, squad_tokens, history_sessions)")
    .in("user_id", memberIds);

  const squadMap = new Map<
    string,
    { id: string; name: string; member_count: number; squad_tokens: number; history_sessions: number }
  >();
  for (const sm of squadMembers ?? []) {
    const raw = sm.squads;
    const squad = (Array.isArray(raw) ? raw[0] : raw) as {
      id: string;
      name: string;
      member_count: number;
      squad_tokens: number;
      history_sessions: number;
    } | null;
    if (squad?.id) squadMap.set(squad.id, squad);
  }

  return NextResponse.json({ squads: Array.from(squadMap.values()) });
}
