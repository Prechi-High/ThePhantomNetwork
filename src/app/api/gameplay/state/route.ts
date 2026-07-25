import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redisGet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { resolvePhaseTiming } from "@/lib/gameplay/phase-timing";
import { getBots } from "@/lib/gameplay/ai-players";
import type { PhaseConfig } from "@/types/gameplay";

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
    .select("*, sessions(title, status, phase_config, total_pool_cents, session_type)")
    .eq("id", subSessionId)
    .single();

  const redisState = await redisGet<{
    phase: number;
    phaseEndsAt: number;
    phaseStartedAt: number;
    round: number;
  }>(redisKeys.subState(subSessionId));

  const sessionPhaseConfig = (subSession?.sessions as { phase_config?: PhaseConfig })?.phase_config;
  const timing = resolvePhaseTiming({
    currentPhase: subSession?.current_phase,
    phaseStartedAt: subSession?.phase_started_at,
    phaseConfig: sessionPhaseConfig,
    redisState,
  });

  const { data: allPlayers } = await admin
    .from("sub_session_players")
    .select("user_id, session_tokens, is_eliminated, squad_id, profiles(username, avatar_id)")
    .eq("sub_session_id", subSessionId)
    .order("session_tokens", { ascending: false });

  const sessionMeta = subSession?.sessions as {
    status?: string;
    total_pool_cents?: number;
    session_type?: string;
    phase_config?: PhaseConfig;
  } | null;

  const sessionType = sessionMeta?.session_type;
  const totalPhases = sessionMeta?.phase_config?.length ?? 6;
  let botEntries: { userId: string; username: string; tokens: number; isEliminated: boolean }[] = [];
  if (sessionType === "ai_practice") {
    const bots = await getBots(subSessionId);
    botEntries = bots
      .filter((b) => !b.isEliminated)
      .map((b) => ({
        userId: b.id,
        username: b.username,
        tokens: b.tokens,
        isEliminated: false,
      }));
  }

  const humanEntries = (allPlayers ?? []).map((p) => {
    const profile = p.profiles as { username?: string; avatar_id?: string } | null;
    return {
      userId: p.user_id,
      username: profile?.username ?? "Player",
      tokens: Number(p.session_tokens),
      isEliminated: p.is_eliminated,
      squadId: p.squad_id,
      avatarId: profile?.avatar_id,
    };
  });

  const combinedRanked = [...humanEntries, ...botEntries]
    .filter((p) => !p.isEliminated)
    .sort((a, b) => b.tokens - a.tokens);

  const topPlayers = combinedRanked.slice(0, 10).map((p, i) => ({
    rank: i + 1,
    username: p.username,
    tokens: p.tokens,
    userId: p.userId,
  }));

  const leaderboard = combinedRanked.slice(0, 15);

  const sorted = combinedRanked;
  const playerRank =
    sorted.findIndex((p) => p.userId === user!.id) + 1 || sorted.length;

  let squadMembers: typeof allPlayers = [];
  if (player.squad_id) {
    squadMembers =
      allPlayers?.filter((p) => p.squad_id === player.squad_id) ?? [];
  }

  const networkPlayers = humanEntries.slice(0, 24).map((p) => ({
    userId: p.userId,
    username: p.username,
    avatarId: p.avatarId,
    squadId: p.squadId,
  }));

  botEntries.slice(0, 8).forEach((b) => {
    networkPlayers.push({
      userId: b.userId,
      username: b.username,
      avatarId: undefined,
      squadId: null,
    });
  });

  const sessionStatus = sessionMeta?.status;
  const session = sessionMeta;

  return NextResponse.json({
    player,
    subSession,
    sessionStatus,
    phase: timing.phase,
    phaseEndsAt: timing.phaseEndsAt ?? null,
    phaseStartedAt: timing.phaseStartedAtMs ?? null,
    round: timing.round,
    maxRoundsPerPhase: 3,
    leaderboard,
    squadMembers,
    playerRank,
    totalPlayers: combinedRanked.length,
    networkPlayers,
    topPlayers,
    totalPoolCents: session?.total_pool_cents,
    totalPhases,
  });
}
