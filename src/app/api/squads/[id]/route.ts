import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: squad, error: squadError } = await supabase
    .from("squads")
    .select("*")
    .eq("id", id)
    .single();

  if (squadError || !squad) {
    return NextResponse.json({ error: "Squad not found" }, { status: 404 });
  }

  const { data: members, error: membersError } = await supabase
    .from("squad_members")
    .select("*, profiles(id, username, avatar_id, level)")
    .eq("squad_id", id);

  if (membersError) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }

  return NextResponse.json({ squad, members: members || [] });
}
