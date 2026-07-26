import { redisIncr, redisSetNx } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { emitLiveFeedEvent } from "@/lib/realtime/event-emitter";
import type { FeedEvent, FeedEventType } from "@/stores/useLiveFeedStore";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const rlKey = redisKeys.rateLimit(key);
  const current = await redisIncr(rlKey, windowSeconds);
  return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
}

export async function acquireSpinLock(
  lockKey: string,
  ttlSeconds: number
): Promise<boolean> {
  return redisSetNx(lockKey, "1", ttlSeconds);
}

const LEGACY_FEED_TYPE_MAP: Record<string, FeedEventType> = {
  phase_start: "phase",
  session_join: "player_joined",
  effect: "effect",
};

export async function publishLiveFeed(
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const subSessionId = metadata?.subSessionId as string | undefined;
  const userId = (metadata?.userId as string) ?? "system";
  const username =
    message.split(" ")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "System";

  if (subSessionId) {
    const feedType = LEGACY_FEED_TYPE_MAP[eventType] ?? "announcement";
    const event: FeedEvent = {
      id: `${eventType}-${Date.now()}`,
      type: feedType,
      timestamp: new Date().toISOString(),
      actor: {
        user_id: userId,
        username: userId === "system" ? "System" : username,
        avatar: "",
      },
      details: { message, eventType, ...metadata },
    };
    await emitLiveFeedEvent(subSessionId, event);
    return;
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin.from("live_feed_events").insert({
    event_type: eventType,
    message,
    metadata: metadata ?? {},
  });
}
