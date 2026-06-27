export const redisKeys = {
  subState: (subSessionId: string) => `sub:${subSessionId}:state`,
  subPlayer: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:player:${userId}`,
  spinLock: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:spin:${userId}:lock`,
  stealInProgress: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:steal:${userId}`,
  leaderboard: (subSessionId: string) => `sub:${subSessionId}:leaderboard`,
  sessionRegistration: (sessionId: string) => `session:${sessionId}:registration`,
  liveFeed: "live:feed",
  rateLimit: (key: string) => `ratelimit:${key}`,
  realtimeChannel: (subSessionId: string) => `realtime:${subSessionId}`,
};
