import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { checkAndAdvanceDuePhases } from "@/lib/gameplay/session-orchestrator";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: toLock } = await admin
    .from("sessions")
    .select("id")
    .eq("status", "open")
    .lte("registration_closes_at", now.toISOString());

  for (const session of toLock ?? []) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ sessionId: session.id, action: "lock" }),
    });
  }

  const { data: toStart } = await admin
    .from("sessions")
    .select("id")
    .eq("status", "locked")
    .lte("starts_at", now.toISOString());

  for (const session of toStart ?? []) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ sessionId: session.id, action: "start" }),
    });
  }

  const advanced = await checkAndAdvanceDuePhases();

  const { data: activeSessions } = await admin
    .from("sessions")
    .select("id")
    .eq("status", "active");

  for (const session of activeSessions ?? []) {
    const { data: subs } = await admin
      .from("sub_sessions")
      .select("id, status")
      .eq("session_id", session.id);

    const allDone = subs?.length && subs.every((s) => s.status === "completed");
    if (allDone) {
      await admin.from("sessions").update({ status: "completed" }).eq("id", session.id);
    }
  }

  return NextResponse.json({
    locked: toLock?.length ?? 0,
    started: toStart?.length ?? 0,
    phasesAdvanced: advanced.length,
  });
}
