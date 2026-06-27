import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function getUpstash(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

function memoryGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key: string, value: string, ttlSeconds?: number) {
  memoryStore.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

export function getRedis() {
  return getUpstash();
}

export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const client = getUpstash();
    if (client) {
      const data = await client.get<string>(key);
      if (data) return JSON.parse(data) as T;
    }
  } catch {
    // fallback
  }
  const mem = memoryGet(key);
  return mem ? (JSON.parse(mem) as T) : null;
}

export async function redisSet(key: string, value: unknown, ttlSeconds?: number) {
  const serialized = JSON.stringify(value);
  try {
    const client = getUpstash();
    if (client) {
      if (ttlSeconds) {
        await client.set(key, serialized, { ex: ttlSeconds });
      } else {
        await client.set(key, serialized);
      }
      return;
    }
  } catch {
    // fallback
  }
  memorySet(key, serialized, ttlSeconds);
}

export async function redisDel(key: string) {
  try {
    const client = getUpstash();
    if (client) await client.del(key);
  } catch {
    // ignore
  }
  memoryStore.delete(key);
}

export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    const client = getUpstash();
    if (client) {
      const val = await client.incr(key);
      if (ttlSeconds && val === 1) {
        await client.expire(key, ttlSeconds);
      }
      return val;
    }
  } catch {
    // fallback
  }
  const current = parseInt(memoryGet(key) ?? "0", 10) + 1;
  memorySet(key, String(current), ttlSeconds);
  return current;
}

export async function redisSetNx(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<boolean> {
  try {
    const client = getUpstash();
    if (client) {
      const result = await client.set(key, value, { nx: true, ex: ttlSeconds });
      return result === "OK";
    }
  } catch {
    // fallback
  }
  if (memoryGet(key)) return false;
  memorySet(key, value, ttlSeconds);
  return true;
}

/** Push event to a list for SSE polling (serverless-safe). */
export async function redisPushEvent(channelKey: string, message: unknown) {
  const listKey = `${channelKey}:events`;
  const payload = JSON.stringify({ ...message as object, at: Date.now() });
  try {
    const client = getUpstash();
    if (client) {
      await client.lpush(listKey, payload);
      await client.ltrim(listKey, 0, 99);
      await client.expire(listKey, 3600);
      return;
    }
  } catch {
    // fallback
  }
  memorySet(listKey, payload, 3600);
}

export async function redisPollEvents(
  channelKey: string,
  since: number
): Promise<unknown[]> {
  const listKey = `${channelKey}:events`;
  try {
    const client = getUpstash();
    if (client) {
      const items = await client.lrange<string>(listKey, 0, 49);
      return (items ?? [])
        .map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        })
        .filter((e): e is { at: number } => e !== null && e.at > since);
    }
  } catch {
    // fallback
  }
  return [];
}

export async function redisPublish(channel: string, message: unknown) {
  await redisPushEvent(channel, message);
}
