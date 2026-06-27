import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Squad name required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("squad_members")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already in a squad" }, { status: 400 });
  }

  const { data: squad, error: squadError } = await admin
    .from("squads")
    .insert({ name: name.trim(), leader_id: user!.id, member_count: 1 })
    .select()
    .single();

  if (squadError) {
    return NextResponse.json({ error: squadError.message }, { status: 500 });
  }

  await admin.from("squad_members").insert({
    squad_id: squad.id,
    user_id: user!.id,
    role: "leader",
  });

  return NextResponse.json({ squad });
}
