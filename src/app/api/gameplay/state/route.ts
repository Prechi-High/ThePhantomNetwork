import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redisGet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const subSessionId = new URL(request.url).searchParams.get("subSessionId");
  if (!subSessionId) {
    return NextResponse.json({ error: "subSessionId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: player } = await admin
    .from("sub_session_players")
    .select("*, profiles(username, avatar_id)")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 404 });
  }

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("*")
    .eq("id", subSessionId)
    .single();

  const redisState = await redisGet<{
    phase: number;
    phaseEndsAt: number;
    round: number;
  }>(redisKeys.subState(subSessionId));

  const { data: leaderboard } = await admin
    .from("sub_session_players")
    .select("user_id, session_tokens, profiles(username)")
    .eq("sub_session_id", subSessionId)
    .eq("is_eliminated", false)
    .order("session_tokens", { ascending: false })
    .limit(10);

  return NextResponse.json({
    player,
    subSession,
    phase: redisState?.phase ?? subSession?.current_phase ?? 0,
    phaseEndsAt: redisState?.phaseEndsAt,
    round: redisState?.round ?? 1,
    leaderboard: leaderboard ?? [],
  });
}
