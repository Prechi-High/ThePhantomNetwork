import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, camps(*)")
    .eq("id", user!.id)
    .single();

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const supabase = await createClient();

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({
      username: body.username,
      avatar_id: body.avatar_id,
    })
    .eq("id", user!.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
}
