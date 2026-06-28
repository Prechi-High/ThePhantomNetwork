import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeStealAmount } from "@/lib/gameplay/steal";
import { redisGet, redisSet, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { BASE_STEAL_AMOUNT } from "@/types/gameplay";

interface StealProgress {
  attackerId: string;
  victimId: string;
  fireBoostTaps: number;
  resolved: boolean;
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, victimId, resolve } = await request.json();
  const admin = createAdminClient();
  const stealKey = redisKeys.stealInProgress(subSessionId, user!.id);

  if (!resolve) {
    await redisSet(stealKey, {
      attackerId: user!.id,
      victimId,
      fireBoostTaps: 0,
      resolved: false,
    } satisfies StealProgress, 30);

    await redisPublish(redisKeys.realtimeChannel(subSessionId), {
      type: "steal_in_progress",
      attackerId: user!.id,
      victimId,
    });

    return NextResponse.json({ initiated: true });
  }

  const progress = await redisGet<StealProgress>(stealKey);
  if (!progress || progress.attackerId !== user!.id) {
    return NextResponse.json({ error: "No steal in progress" }, { status: 400 });
  }

  const { data: attacker } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  const { data: victim } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", progress.victimId)
    .single();

  if (!attacker || !victim) {
    return NextResponse.json({ error: "Players not found" }, { status: 404 });
  }

  let blocked = false;
  if (victim.shield_count > 0) {
    blocked = true;
    const newShieldCount = victim.shield_boost_active
      ? Math.max(0, victim.shield_count - 1)
      : 0;
    await admin
      .from("sub_session_players")
      .update({ shield_count: newShieldCount })
      .eq("id", victim.id);
  } else if (!victim.cloak_active) {
    const totalSteal = computeStealAmount(
      BASE_STEAL_AMOUNT,
      progress.fireBoostTaps,
      attacker.steal_boost_active
    );

    const victimTokens = Math.max(0, Number(victim.session_tokens) - totalSteal);
    const attackerTokens = Number(attacker.session_tokens) + totalSteal;

    await admin
      .from("sub_session_players")
      .update({ session_tokens: victimTokens })
      .eq("id", victim.id);
    await admin
      .from("sub_session_players")
      .update({ session_tokens: attackerTokens })
      .eq("id", attacker.id);

    await admin.from("steals").insert({
      sub_session_id: subSessionId,
      attacker_id: user!.id,
      victim_id: progress.victimId,
      base_amount: BASE_STEAL_AMOUNT,
      boost_amount: totalSteal - BASE_STEAL_AMOUNT,
      total_amount: totalSteal,
      blocked_by_shield: false,
    });

    const orderedPair = [user!.id, progress.victimId].sort();
    await admin.from("rivalries").upsert(
      {
        user_a: orderedPair[0],
        user_b: orderedPair[1],
        intensity: 1,
        last_interaction_at: new Date().toISOString(),
      },
      { onConflict: "user_a,user_b" }
    );
  }

  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "steal_resolved",
    attackerId: user!.id,
    victimId: progress.victimId,
    blocked,
  });

  // Publish a global event to refresh state for all clients (for leaderboard/squad tokens)
  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "tokens_updated",
  });

  return NextResponse.json({ success: true, blocked });
}
