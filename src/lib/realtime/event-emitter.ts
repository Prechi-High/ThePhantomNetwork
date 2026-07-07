import { redisPushEvent } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { FeedEvent } from "@/stores/useLiveFeedStore";
import type { LeaderboardEntry, SquadLeaderboardEntry } from "@/stores/useLeaderboardStore";
import type { ActiveEffect } from "@/stores/useEffectsStore";

/**
 * Emits real-time events to connected clients via EventSource
 * All events are published to a Redis channel and picked up by polling clients
 */

/**
 * Emit a live feed event when something happens in gameplay
 * Examples: steal, revive, elimination, phase change, etc.
 */
export async function emitLiveFeedEvent(
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
 * Emit leaderboard update when player rank changes
 */
export async function emitLeaderboardRankChange(
  subSessionId: string,
  userId: string,
  oldRank: number,
  newRank: number,
  newTokens: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "leaderboard:updated",
    payload: {
      event: "rank_changed",
      user_id: userId,
      old_rank: oldRank,
      new_rank: newRank,
      new_tokens: newTokens,
    },
  });
}

/**
 * Emit squad leaderboard update when squad rank changes
 */
export async function emitSquadLeaderboardRankChange(
  subSessionId: string,
  squadId: string,
  oldRank: number,
  newRank: number,
  newSquadTokens: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "squad_leaderboard:rank_changed",
    payload: {
      squad_id: squadId,
      old_rank: oldRank,
      new_rank: newRank,
      new_squad_tokens: newSquadTokens,
    },
  });
}

/**
 * Emit when an effect is activated on a player
 * Sent to all players but typically displayed for affected player only
 */
export async function emitEffectActivated(
  subSessionId: string,
  userId: string,
  effect: ActiveEffect
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  // Prefix with userId to allow client-side filtering
  await redisPushEvent(channel, {
    type: "effect:activated",
    userId,
    payload: effect,
  });
}

/**
 * Emit when an effect expires on a player
 * Sent to all players but typically displayed for affected player only
 */
export async function emitEffectExpired(
  subSessionId: string,
  userId: string,
  effectId: string
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "effect:expired",
    userId,
    payload: {
      effectId,
    },
  });
}

/**
 * Emit when a skill becomes available (cooldown ends)
 * Sent to specific player
 */
export async function emitSkillAvailable(
  subSessionId: string,
  userId: string,
  skillId: string,
  charges: number = 1,
  maxCharges: number = 1
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "skill:available",
    userId,
    payload: {
      skill_id: skillId,
      available: true,
      charges,
      max_charges: maxCharges,
      cooldown_ms: 0,
    },
  });
}

/**
 * Emit when a skill gains a charge (for multi-charge skills)
 * Sent to specific player
 */
export async function emitSkillCharged(
  subSessionId: string,
  userId: string,
  skillId: string,
  charges: number,
  maxCharges: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "skill:charged",
    userId,
    payload: {
      skill_id: skillId,
      charges,
      max_charges: maxCharges,
    },
  });
}

/**
 * Emit when a player is eliminated
 */
export async function emitPlayerEliminated(
  subSessionId: string,
  userId: string,
  eliminatedBy?: string
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "livefeed:event",
    payload: {
      id: `elimination-${userId}-${Date.now()}`,
      type: "elimination",
      timestamp: new Date().toISOString(),
      actor: {
        user_id: eliminatedBy || "system",
        username: eliminatedBy ? "Player" : "System",
        avatar: "",
      },
      target: {
        user_id: userId,
        username: "Target",
      },
      details: {
        eliminatedBy,
      },
    },
  });
}

/**
 * Emit when a phase changes
 */
export async function emitPhaseChange(
  subSessionId: string,
  phase: number,
  round: number,
  phaseEndsAt: number
) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "livefeed:event",
    payload: {
      id: `phase-${phase}-${Date.now()}`,
      type: "phase",
      timestamp: new Date().toISOString(),
      actor: {
        user_id: "system",
        username: "System",
        avatar: "",
      },
      details: {
        phase,
        round,
        phaseName: `Phase ${phase}`,
      },
    },
  });
}

/**
 * Emit when Shadow Surge is triggered
 */
export async function emitShadowSurge(subSessionId: string, surgePercent: number) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "livefeed:event",
    payload: {
      id: `surge-${Date.now()}`,
      type: "surge",
      timestamp: new Date().toISOString(),
      actor: {
        user_id: "system",
        username: "System",
        avatar: "",
      },
      details: {
        surge_percent: surgePercent,
      },
    },
  });
}
