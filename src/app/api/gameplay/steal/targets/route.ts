import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildStealTargets, isEligibleStealTarget } from "@/lib/gameplay/steal";
import { getBots } from "@/lib/gameplay/ai-players";
import { redisSet, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, victimId, preview } = await request.json();
  const admin = createAdminClient();

  if (preview && victimId) {
    await redisSet(
      redisKeys.stealPrepWarning(subSessionId, victimId),
      { at: Date.now() },
      30
    );
    await redisPublish(redisKeys.realtimeChannel(subSessionId), {
      type: "steal_prep_warning",
      victimId,
    });
    return NextResponse.json({ warningSent: true });
  }

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("sessions(session_type)")
    .eq("id", subSessionId)
    .single();

  const sessionType = (subSession?.sessions as { session_type?: string } | null)?.session_type;

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*, profiles(username)")
    .eq("sub_session_id", subSessionId)
    .eq("is_eliminated", false)
    .order("session_tokens", { ascending: false });

  const { data: rivalries } = await admin
    .from("rivalries")
    .select("*")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`);

  const { data: recentSteals } = await admin
    .from("steals")
    .select("attacker_id, victim_id, created_at")
    .eq("sub_session_id", subSessionId)
    .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

  const rivalIds = new Set(
    (rivalries ?? []).map((r) => (r.user_a === user!.id ? r.user_b : r.user_a))
  );

  const recentActiveIds = new Set(
    (recentSteals ?? []).flatMap((s) => [s.attacker_id, s.victim_id])
  );

  const attackedYouIds = new Set(
    (recentSteals ?? [])
      .filter((s) => s.victim_id === user!.id)
      .map((s) => s.attacker_id)
  );

  const ranked = (players ?? []).map((p, i) => ({ ...p, rank: i + 1 }));

  const humanCandidates = ranked
    .filter((p) =>
      isEligibleStealTarget(
        {
          userId: p.user_id,
          tokens: Number(p.session_tokens),
          isEliminated: p.is_eliminated,
          shieldCount: p.shield_count,
          cloakActive: p.cloak_active,
        },
        user!.id
      )
    )
    .map((p) => ({
      userId: p.user_id,
      username: (p.profiles as { username: string })?.username ?? "Unknown",
      tokens: Number(p.session_tokens),
      rank: p.rank,
      tokenScore: Number(p.session_tokens),
      rivalryScore: rivalIds.has(p.user_id) ? 100 : 0,
      recentStealScore: recentActiveIds.has(p.user_id) ? 80 : 0,
      recentActivityScore: recentActiveIds.has(p.user_id) ? 60 : 0,
      attackedYouScore: attackedYouIds.has(p.user_id) ? 100 : 0,
    }));

  let botCandidates: typeof humanCandidates = [];
  if (sessionType === "ai_practice") {
    const bots = await getBots(subSessionId);
    botCandidates = bots
      .filter((bot) =>
        isEligibleStealTarget(
          {
            userId: bot.id,
            tokens: bot.tokens,
            isEliminated: bot.isEliminated,
            shieldCount: 0,
            cloakActive: false,
          },
          user!.id
        )
      )
      .map((bot, i) => ({
        userId: bot.id,
        username: bot.username,
        tokens: bot.tokens,
        rank: ranked.length + i + 1,
        tokenScore: bot.tokens,
        rivalryScore: 0,
        recentStealScore: 0,
        recentActivityScore: 40,
        attackedYouScore: 0,
      }));
  }

  const targets = buildStealTargets(
    [...humanCandidates, ...botCandidates],
    rivalIds,
    recentActiveIds,
    attackedYouIds
  );

  return NextResponse.json({ targets });
}
