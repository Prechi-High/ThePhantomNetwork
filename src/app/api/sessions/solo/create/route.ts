import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { REGISTRATION_LOCK_MINUTES } from "@/types/gameplay";
import type { SessionMode, SessionType } from "@/types/gameplay";

type SoloCreateSessionType = Exclude<SessionType, "ai_practice">;

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const sessionType = (body.sessionType ?? "public") as SessionType;

  if (sessionType === "ai_practice") {
    return NextResponse.json(
      { error: "AI Practice sessions use POST /api/sessions/practice/create" },
      { status: 400 }
    );
  }

  const soloSessionType = sessionType as SoloCreateSessionType;
  const sessionMode: SessionMode = body.sessionMode ?? "solo";
  const entryFeeCents = body.entryFeeCents ?? 500;
  const maxPlayers = body.maxPlayers ?? 50;

  const admin = createAdminClient();
  const startsAt = new Date(Date.now() + 5 * 60 * 1000);
  const registrationClosesAt = new Date(
    startsAt.getTime() - REGISTRATION_LOCK_MINUTES * 60 * 1000
  );

  const titles: Record<SoloCreateSessionType, string> = {
    public: "Public Solo Session",
    friend_duel: "Friend Duel",
    private: "Private Solo Room",
  };

  const { data: session, error: createErr } = await admin
    .from("sessions")
    .insert({
      title: titles[soloSessionType] ?? "Solo Session",
      status: "open",
      starts_at: startsAt.toISOString(),
      registration_closes_at: registrationClosesAt.toISOString(),
      entry_fee_cents: entryFeeCents,
      max_players: maxPlayers,
      session_mode: sessionMode,
      session_type: soloSessionType,
      economy_config: {},
    })
    .select()
    .single();

  if (createErr || !session) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({
    session,
    prepareUrl: `/sessions/prepare?sessionId=${session.id}&type=${soloSessionType}`,
  });
}
