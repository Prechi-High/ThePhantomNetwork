import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: squad } = await supabase
    .from("squads")
    .select("*")
    .eq("id", id)
    .single();

  const { data: members } = await supabase
    .from("squad_members")
    .select("*, profiles(id, username, avatar_id, level)")
    .eq("squad_id", id);

  return NextResponse.json({ squad, members });
}
