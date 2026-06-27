import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data } = await supabase
    .from("session_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ sessions: data ?? [] });
}
