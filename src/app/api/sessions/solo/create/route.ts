import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { REGISTRATION_LOCK_MINUTES } from "@/types/gameplay";
import type { SessionMode, SessionType } from "@/types/gameplay";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const sessionType: SessionType = body.sessionType ?? "public";

  if (sessionType === "ai_practice") {
    return NextResponse.json(
      { error: "AI Practice sessions use POST /api/sessions/practice/create" },
      { status: 400 }
    );
  }

  const sessionMode: SessionMode = body.sessionMode ?? "solo";
  const entryFeeCents = body.entryFeeCents ?? 500;
  const maxPlayers = body.maxPlayers ?? 50;
  const botCount = body.botCount ?? 10;

  const admin = createAdminClient();
  const startsAt = new Date(Date.now() + 5 * 60 * 1000);
  const registrationClosesAt = new Date(
    startsAt.getTime() - REGISTRATION_LOCK_MINUTES * 60 * 1000
  );

  const titles: Record<SessionType, string> = {
    public: "Public Solo Session",
    ai_practice: "AI Practice Session",
    friend_duel: "Friend Duel",
    private: "Private Solo Room",
  };

  const economyConfig =
    sessionType === "ai_practice" ? { ai_bot_count: botCount } : {};

  const { data: session, error: createErr } = await admin
    .from("sessions")
    .insert({
      title: titles[sessionType] ?? "Solo Session",
      status: "open",
      starts_at: startsAt.toISOString(),
      registration_closes_at: registrationClosesAt.toISOString(),
      entry_fee_cents: entryFeeCents,
      max_players: maxPlayers,
      session_mode: sessionMode,
      session_type: sessionType,
      economy_config: economyConfig,
    })
    .select()
    .single();

  if (createErr || !session) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({
    session,
    prepareUrl: `/sessions/prepare?sessionId=${session.id}&type=${sessionType}`,
  });
}
