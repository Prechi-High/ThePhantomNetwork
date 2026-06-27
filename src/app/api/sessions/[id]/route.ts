import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { count } = await supabase
    .from("session_registrations")
    .select("*", { count: "exact", head: true })
    .eq("session_id", id);

  return NextResponse.json({
    session,
    registeredCount: count ?? session.registered_count,
    poolCents: session.total_pool_cents,
  });
}
