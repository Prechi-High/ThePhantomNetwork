import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { withErrorMonitoring } from "@/lib/monitoring/api-wrap";
import { requireAuth } from "@/lib/api/auth-helpers";

async function getHandler() {
  const { user } = await requireAuth();
  const admin = createAdminClient();

  const { data: publicSessions, error: publicError } = await admin
    .from("sessions")
    .select("*")
    .in("status", ["open", "locked", "active", "completed"])
    .or("session_type.neq.ai_practice,session_type.is.null")
    .order("starts_at", { ascending: true });

  if (publicError) {
    return NextResponse.json({ error: publicError.message }, { status: 500 });
  }

  let practiceSessions: typeof publicSessions = [];
  if (user?.id) {
    const { data: practice, error: practiceError } = await admin
      .from("sessions")
      .select("*")
      .eq("session_type", "ai_practice")
      .eq("created_by", user.id)
      .in("status", ["open", "locked", "active", "completed"])
      .order("starts_at", { ascending: false });

    if (practiceError) {
      return NextResponse.json({ error: practiceError.message }, { status: 500 });
    }
    practiceSessions = practice ?? [];
  }

  const allSessions = [...(publicSessions ?? []), ...practiceSessions];
  const sessionIds = allSessions.map((s) => s.id);

  const { data: userRegistrations } = await admin
    .from("session_registrations")
    .select("session_id")
    .eq("user_id", user?.id ?? "")
    .in("session_id", sessionIds.length ? sessionIds : ["00000000-0000-0000-0000-000000000000"]);

  const registeredSessionIds = new Set((userRegistrations || []).map((r) => r.session_id));

  const withRegistration = (sessions: typeof publicSessions) =>
    (sessions ?? []).map((session) => ({
      ...session,
      is_user_registered: registeredSessionIds.has(session.id),
    }));

  return NextResponse.json({
    sessions: withRegistration(publicSessions),
    practiceSessions: withRegistration(practiceSessions),
  });
}

export const GET = withErrorMonitoring("session", getHandler);
