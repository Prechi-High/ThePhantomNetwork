import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubSessions } from "@/lib/gameplay/matchmaking";
import {
  applyInventoryAtSessionStart,
  initializeSubSessionState,
} from "@/lib/gameplay/session-orchestrator";
import { REGISTRATION_LOCK_MINUTES } from "@/types/gameplay";
import type { PhaseConfig } from "@/types/gameplay";
import { requireAdmin, verifyAdminOrCron } from "@/lib/api/role-helpers";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbError } = await admin
    .from("sessions")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(100);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await verifyAdminOrCron(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, action } = await request.json();
  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (action === "lock" && session.status === "open") {
    await admin.from("sessions").update({ status: "locked" }).eq("id", sessionId);

    const { data: registrations } = await admin
      .from("session_registrations")
      .select("user_id, squad_id")
      .eq("session_id", sessionId);

    const squadMap = new Map<string, string[]>();
    for (const reg of registrations ?? []) {
      if (reg.squad_id) {
        const members = squadMap.get(reg.squad_id) ?? [];
        members.push(reg.user_id);
        squadMap.set(reg.squad_id, members);
      }
    }

    const players = (registrations ?? []).map((r) => ({
      userId: r.user_id,
      squadId: r.squad_id ?? undefined,
      squadMemberIds: r.squad_id ? squadMap.get(r.squad_id) : undefined,
      isPermanentSquad: !!r.squad_id,
    }));

    const assignments = createSubSessions(players);

    for (const assignment of assignments) {
      const poolCents = assignment.players.length * session.entry_fee_cents;
      const { data: subSession } = await admin
        .from("sub_sessions")
        .insert({
          session_id: sessionId,
          label: assignment.label,
          player_count: assignment.players.length,
          pool_cents: poolCents,
          status: "pending",
        })
        .select()
        .single();

      if (subSession) {
        for (const player of assignment.players) {
          await admin.from("sub_session_players").insert({
            sub_session_id: subSession.id,
            user_id: player.userId,
            squad_id: player.squadId ?? null,
            is_temporary_squad: !player.isPermanentSquad,
          });
        }
      }
    }

    return NextResponse.json({ success: true, subSessions: assignments.length });
  }

  if (action === "start" && session.status === "locked") {
    await admin.from("sessions").update({ status: "active" }).eq("id", sessionId);
    await applyInventoryAtSessionStart(sessionId);

    const phaseConfig = session.phase_config as PhaseConfig;
    const { data: subSessions } = await admin
      .from("sub_sessions")
      .select("id")
      .eq("session_id", sessionId);

    for (const sub of subSessions ?? []) {
      await admin
        .from("sub_sessions")
        .update({
          status: "active",
          current_phase: 1,
          phase_started_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
      await initializeSubSessionState(sub.id, phaseConfig);
    }

    return NextResponse.json({ success: true, subSessions: subSessions?.length ?? 0 });
  }

  return NextResponse.json({ error: "Invalid action or status" }, { status: 400 });
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const admin = createAdminClient();

  const startsAt = new Date(body.starts_at);
  const registrationClosesAt = new Date(
    startsAt.getTime() - REGISTRATION_LOCK_MINUTES * 60 * 1000
  );

  const { data, error: insertError } = await admin
    .from("sessions")
    .insert({
      title: body.title,
      status: body.status ?? "open",
      starts_at: startsAt.toISOString(),
      registration_closes_at: registrationClosesAt.toISOString(),
      entry_fee_cents: body.entry_fee_cents ?? 500,
      max_players: body.max_players ?? 1000,
      phase_config: body.phase_config,
      platform_fee_pct: body.platform_fee_pct ?? 15,
      economy_config: body.economy_config,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}
