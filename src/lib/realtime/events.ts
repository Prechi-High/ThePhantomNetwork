/**
 * Real-time event emission utilities for gameplay events
 * Emits events to Redis pub/sub for WebSocket clients to receive
 */

import { redisPushEvent } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { FeedEvent } from "@/stores/useLiveFeedStore";
import type { ActiveEffect } from "@/stores/useEffectsStore";

/**
 * REALTIME-1: Emit livefeed event to all users in session
 */
export async function emitLivefeedEvent(
  subSessionId: string,
  event: FeedEvent
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "livefeed:event",
    payload: event,
  });
}

/**
 * REALTIME-2a: Emit leaderboard rank change to all users in session
 */
export async function emitLeaderboardRankChanged(
  subSessionId: string,
  userId: string,
  oldRank: number,
  newRank: number,
  newTokens: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "leaderboard:updated",
    event: "rank_changed",
    user_id: userId,
    old_rank: oldRank,
    new_rank: newRank,
    new_tokens: newTokens,
  });
}

/**
 * REALTIME-2b: Emit squad leaderboard rank change to all users in session
 */
export async function emitSquadLeaderboardRankChanged(
  subSessionId: string,
  squadId: string,
  oldRank: number,
  newRank: number,
  squadTokens: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "squad_leaderboard:rank_changed",
    squad_id: squadId,
    old_rank: oldRank,
    new_rank: newRank,
    squad_tokens: squadTokens,
  });
}

/**
 * REALTIME-3a: Emit effect activated event to affected player only
 */
export async function emitEffectActivated(
  subSessionId: string,
  userId: string,
  effect: ActiveEffect
) {
  // Use a user-specific channel for player-only events
  const channel = redisKeys.realtimeChannel(`${subSessionId}:user:${userId}`);
  await redisPushEvent(channel, {
    type: "effect:activated",
    payload: effect,
  });
}

/**
 * REALTIME-3b: Emit effect expired event to affected player only
 */
export async function emitEffectExpired(
  subSessionId: string,
  userId: string,
  effectId: string
) {
  const channel = redisKeys.realtimeChannel(`${subSessionId}:user:${userId}`);
  await redisPushEvent(channel, {
    type: "effect:expired",
    effect_id: effectId,
  });
}

/**
 * REALTIME-4a: Emit skill available event to affected player only
 */
export async function emitSkillAvailable(
  subSessionId: string,
  userId: string,
  skillId: string,
  charges: number,
  cooldownMs: number = 0
) {
  const channel = redisKeys.realtimeChannel(`${subSessionId}:user:${userId}`);
  await redisPushEvent(channel, {
    type: "skill:available",
    skill_id: skillId,
    available: true,
    charges,
    cooldown_ms: cooldownMs,
  });
}

/**
 * REALTIME-4b: Emit skill charged event to affected player only
 */
export async function emitSkillCharged(
  subSessionId: string,
  userId: string,
  skillId: string,
  charges: number,
  maxCharges: number
) {
  const channel = redisKeys.realtimeChannel(`${subSessionId}:user:${userId}`);
  await redisPushEvent(channel, {
    type: "skill:charged",
    skill_id: skillId,
    charges,
    max_charges: maxCharges,
  });
}
