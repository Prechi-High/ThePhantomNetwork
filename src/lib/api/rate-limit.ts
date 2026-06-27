import { redisIncr, redisSetNx, redisGet, redisSet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

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

export async function publishLiveFeed(
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { redisPublish } = await import("@/lib/redis/client");
  const admin = createAdminClient();

  await admin.from("live_feed_events").insert({
    event_type: eventType,
    message,
    metadata: metadata ?? {},
  });

  await redisPublish("live:feed", { eventType, message, metadata, at: Date.now() });
}
