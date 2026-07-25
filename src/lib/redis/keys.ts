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
  tacticalArmed: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:tactical:${userId}:armed`,
  tacticalDebuff: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:tactical:${userId}:debuff`,
  tacticalMark: (subSessionId: string) => `sub:${subSessionId}:tactical:mark`,
  stealSaved: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:steal:${userId}:saved`,
  stealPrepWarning: (subSessionId: string, userId: string) =>
    `sub:${subSessionId}:steal:warning:${userId}`,
};
