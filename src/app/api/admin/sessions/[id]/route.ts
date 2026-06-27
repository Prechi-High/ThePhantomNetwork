import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";
import { REGISTRATION_LOCK_MINUTES } from "@/types/gameplay";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: session, error: dbError } = await admin
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { count } = await admin
    .from("session_registrations")
    .select("*", { count: "exact", head: true })
    .eq("session_id", id);

  const { data: subSessions } = await admin
    .from("sub_sessions")
    .select("id, label, status, player_count, pool_cents")
    .eq("session_id", id);

  return NextResponse.json({
    session,
    registeredCount: count ?? session.registered_count,
    subSessions: subSessions ?? [],
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("sessions")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!["draft", "open"].includes(existing.status) && body.starts_at) {
    return NextResponse.json(
      { error: "Cannot reschedule after registration lock" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (body.title) updates.title = body.title;
  if (body.entry_fee_cents != null) updates.entry_fee_cents = body.entry_fee_cents;
  if (body.max_players != null) updates.max_players = body.max_players;
  if (body.platform_fee_pct != null) updates.platform_fee_pct = body.platform_fee_pct;
  if (body.phase_config) updates.phase_config = body.phase_config;
  if (body.economy_config) updates.economy_config = body.economy_config;
  if (body.status) updates.status = body.status;

  if (body.starts_at) {
    const startsAt = new Date(body.starts_at);
    updates.starts_at = startsAt.toISOString();
    updates.registration_closes_at = new Date(
      startsAt.getTime() - REGISTRATION_LOCK_MINUTES * 60 * 1000
    ).toISOString();
  }

  const { data, error: updateError } = await admin
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("sessions")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!["draft", "open"].includes(existing.status)) {
    return NextResponse.json(
      { error: "Only draft or open sessions can be cancelled" },
      { status: 400 }
    );
  }

  await admin.from("sessions").update({ status: "invalid" }).eq("id", id);
  return NextResponse.json({ success: true });
}
