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
    .select("*, sessions(title, status)")
    .eq("id", subSessionId)
    .single();

  const redisState = await redisGet<{
    phase: number;
    phaseEndsAt: number;
    phaseStartedAt: number;
    round: number;
  }>(redisKeys.subState(subSessionId));

  const { data: allPlayers } = await admin
    .from("sub_session_players")
    .select("user_id, session_tokens, is_eliminated, squad_id, profiles(username, avatar_id)")
    .eq("sub_session_id", subSessionId)
    .order("session_tokens", { ascending: false });

  const leaderboard = (allPlayers ?? []).filter((p) => !p.is_eliminated).slice(0, 15);

  const sorted = [...(allPlayers ?? [])].sort(
    (a, b) => Number(b.session_tokens) - Number(a.session_tokens)
  );
  const playerRank =
    sorted.findIndex((p) => p.user_id === user!.id) + 1 || sorted.length;

  let squadMembers: typeof allPlayers = [];
  if (player.squad_id) {
    squadMembers =
      allPlayers?.filter((p) => p.squad_id === player.squad_id) ?? [];
  }

  const networkPlayers = (allPlayers ?? []).slice(0, 24).map((p) => {
    const profile = p.profiles as { username?: string; avatar_id?: string } | null;
    return {
      userId: p.user_id,
      username: profile?.username ?? "Player",
      avatarId: profile?.avatar_id,
      squadId: p.squad_id,
    };
  });

  return NextResponse.json({
    player,
    subSession,
    phase: redisState?.phase ?? subSession?.current_phase ?? 1,
    phaseEndsAt: redisState?.phaseEndsAt ?? null,
    phaseStartedAt: redisState?.phaseStartedAt ?? null,
    round: redisState?.round ?? 1,
    maxRoundsPerPhase: 3,
    leaderboard,
    squadMembers,
    playerRank,
    totalPlayers: allPlayers?.length ?? 0,
    networkPlayers,
  });
}
