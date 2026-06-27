import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { withErrorMonitoring } from "@/lib/monitoring/api-wrap";

async function getHandler(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: session, error } = await admin
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: error?.message ?? "Session not found" }, { status: 404 });
  }

  const { count } = await admin
    .from("session_registrations")
    .select("*", { count: "exact", head: true })
    .eq("session_id", id);

  return NextResponse.json({
    session,
    registeredCount: count ?? session.registered_count,
    poolCents: session.total_pool_cents,
  });
}

export const GET = withErrorMonitoring("session", getHandler);
