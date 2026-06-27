import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { redisGet, redisSet, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { MAX_FIRE_BOOST_TAPS } from "@/types/gameplay";

interface StealProgress {
  attackerId: string;
  victimId: string;
  fireBoostTaps: number;
  resolved: boolean;
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, attackerId } = await request.json();

  const stealKey = redisKeys.stealInProgress(subSessionId, attackerId);
  const progress = await redisGet<StealProgress>(stealKey);

  if (!progress || progress.resolved) {
    return NextResponse.json({ error: "No active steal" }, { status: 400 });
  }

  if (progress.attackerId === user!.id) {
    return NextResponse.json({ error: "Cannot boost own steal" }, { status: 400 });
  }

  const newTaps = Math.min(progress.fireBoostTaps + 1, MAX_FIRE_BOOST_TAPS);
  await redisSet(stealKey, { ...progress, fireBoostTaps: newTaps }, 30);

  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "steal_boost",
    attackerId,
    boosterId: user!.id,
    taps: newTaps,
  });

  return NextResponse.json({ taps: newTaps, maxTaps: MAX_FIRE_BOOST_TAPS });
}
