import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { rollSpinOutcome, applySpinTokens } from "@/lib/gameplay/spin";
import { getRedis, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { checkRateLimit, acquireSpinLock } from "@/lib/api/rate-limit";
import { SPIN_DURATION_MS } from "@/types/gameplay";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId } = await request.json();
  const rl = await checkRateLimit(`spin:${user!.id}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const lockKey = redisKeys.spinLock(subSessionId, user!.id);
  const locked = await acquireSpinLock(lockKey, SPIN_DURATION_MS / 1000);
  if (!locked) {
    return NextResponse.json({ error: "Spin in progress or on cooldown" }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data: player } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!player || player.is_eliminated) {
    return NextResponse.json({ error: "Cannot spin" }, { status: 400 });
  }

  const result = rollSpinOutcome();
  let newTokens = Number(player.session_tokens);

  if (result.outcome !== "STEAL") {
    newTokens = applySpinTokens(newTokens, result.outcome);
    await admin
      .from("sub_session_players")
      .update({ session_tokens: newTokens })
      .eq("id", player.id);

    await admin.from("session_events").insert({
      sub_session_id: subSessionId,
      user_id: user!.id,
      event_type: "spin",
      payload: { outcome: result.outcome, tokenDelta: result.tokenDelta },
    });
  }

  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: result.outcome === "STEAL" ? "steal_spin" : "spin_result",
    userId: user!.id,
    outcome: result.outcome,
    tokens: newTokens,
    animationSeed: result.animationSeed,
  });

  return NextResponse.json({
    ...result,
    tokens: newTokens,
    requiresTargetSelection: result.outcome === "STEAL",
  });
}
