import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { withErrorMonitoring } from "@/lib/monitoring/api-wrap";
import { requireAuth } from "@/lib/api/auth-helpers";

async function getHandler() {
  const { user } = await requireAuth();
  const admin = createAdminClient();
  const { data: sessions, error } = await admin
    .from("sessions")
    .select("*")
    .in("status", ["open", "locked", "active", "completed"])
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessionIds = (sessions || []).map((s) => s.id);

  const { data: userRegistrations } = await admin
    .from("session_registrations")
    .select("session_id")
    .eq("user_id", user?.id ?? "")
    .in("session_id", sessionIds);

  const registeredSessionIds = new Set((userRegistrations || []).map(r => r.session_id));

  const sessionsWithRegistrationStatus = (sessions || []).map(session => ({
    ...session,
    is_user_registered: registeredSessionIds.has(session.id)
  }));

  return NextResponse.json({ sessions: sessionsWithRegistrationStatus });
}

export const GET = withErrorMonitoring("session", getHandler);
