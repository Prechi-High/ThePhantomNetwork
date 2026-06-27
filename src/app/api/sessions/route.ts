import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { withErrorMonitoring } from "@/lib/monitoring/api-wrap";

async function getHandler() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sessions")
    .select("*")
    .in("status", ["open", "locked", "active"])
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data ?? [] });
}

export const GET = withErrorMonitoring("session", getHandler);
