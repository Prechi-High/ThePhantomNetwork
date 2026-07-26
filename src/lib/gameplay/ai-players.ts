/**
 * AI bot state stored in Redis (avoids auth.users FK requirement).
 */

import { redisGet, redisSet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { emitLiveFeedEvent } from "@/lib/realtime/event-emitter";
import type { FeedEvent } from "@/stores/useLiveFeedStore";

const BOT_NAMES = [
  "ShadowAce", "NightRaven", "IronLegacy", "StormBlade", "GhostKing",
  "Vortex", "SilentWolf", "CrimsonFox", "DarkPulse", "NeonStrike",
  "SteelHeart", "VoidRunner", "BlazeKnight", "EchoFang", "DarkLegacy",
];

export interface AiBot {
  id: string;
  username: string;
  tokens: number;
  isEliminated: boolean;
  shieldExpiresAt?: number;
}

export function isAiBotId(userId: string): boolean {
  return userId.startsWith("bot-");
}

function botsKey(subSessionId: string) {
  return `sub:${subSessionId}:ai_bots`;
}

function botFeedEvent(
  bot: AiBot,
  type: FeedEvent["type"],
  details: Record<string, unknown>,
  target?: { id: string; username: string }
): FeedEvent {
  return {
    id: `bot-${type}-${bot.id}-${Date.now()}`,
    type,
    timestamp: new Date().toISOString(),
    actor: {
      user_id: bot.id,
      username: bot.username,
      avatar: "",
    },
    target: target
      ? { user_id: target.id, username: target.username }
      : undefined,
    details,
  };
}

export async function seedAiBotsForSession(
  sessionId: string,
  botCount: number
): Promise<void> {
  void sessionId;
  void botCount;
}

export async function initBotsInSubSession(
  subSessionId: string,
  botCount: number
): Promise<AiBot[]> {
  const bots: AiBot[] = [];
  for (let i = 0; i < botCount; i++) {
    bots.push({
      id: `bot-${subSessionId}-${i}`,
      username: BOT_NAMES[i % BOT_NAMES.length] + (i >= BOT_NAMES.length ? String(i) : ""),
      tokens: 5 + Math.floor(Math.random() * 6),
      isEliminated: false,
    });
  }
  await redisSet(botsKey(subSessionId), bots, 3600);
  return bots;
}

export async function getBots(subSessionId: string): Promise<AiBot[]> {
  return (await redisGet<AiBot[]>(botsKey(subSessionId))) ?? [];
}

export async function saveBots(subSessionId: string, bots: AiBot[]): Promise<void> {
  await redisSet(botsKey(subSessionId), bots, 3600);
}

export async function adjustBotTokens(
  subSessionId: string,
  botId: string,
  delta: number
): Promise<number | null> {
  const bots = await getBots(subSessionId);
  const idx = bots.findIndex((b) => b.id === botId);
  if (idx === -1) return null;
  bots[idx].tokens = Math.max(0, Math.round((bots[idx].tokens + delta) * 10) / 10);
  await saveBots(subSessionId, bots);
  return bots[idx].tokens;
}

export async function runBotSpinTick(subSessionId: string): Promise<number> {
  const bots = await getBots(subSessionId);
  if (!bots.length) return 0;

  let spins = 0;
  const now = Date.now();
  const activeBots = bots.filter((b) => !b.isEliminated && b.tokens >= 0);

  for (const bot of activeBots) {
    if (bot.shieldExpiresAt && bot.shieldExpiresAt <= now) {
      bot.shieldExpiresAt = undefined;
    }

    if (Math.random() > 0.35) continue;

    const roll = Math.random();
    if (roll < 0.08 && activeBots.length >= 2) {
      const victims = activeBots.filter(
        (b) =>
          b.id !== bot.id &&
          b.tokens >= 1 &&
          !(b.shieldExpiresAt && b.shieldExpiresAt > now)
      );
      if (victims.length) {
        const victim = victims[Math.floor(Math.random() * victims.length)];
        const stealAmount = Math.min(1, victim.tokens);
        victim.tokens = Math.round((victim.tokens - stealAmount) * 10) / 10;
        bot.tokens = Math.round((bot.tokens + stealAmount) * 10) / 10;
        await emitLiveFeedEvent(
          subSessionId,
          botFeedEvent(bot, "steal", { amount: stealAmount }, victim)
        );
        spins++;
        continue;
      }
    }

    if (roll < 0.12 && !bot.shieldExpiresAt) {
      bot.shieldExpiresAt = now + 30_000;
      await emitLiveFeedEvent(
        subSessionId,
        botFeedEvent(bot, "effect", { effect: "guardian" })
      );
      spins++;
      continue;
    }

    const outcomes = [3, 1, 0.5, 0];
    const gain = outcomes[Math.floor(Math.random() * outcomes.length)];
    bot.tokens = Math.round((bot.tokens + gain) * 10) / 10;

    if (gain >= 1) {
      await emitLiveFeedEvent(
        subSessionId,
        botFeedEvent(bot, gain >= 3 ? "lead" : "effect", { tokens: gain, spin: true })
      );
    }

    spins++;
  }

  await saveBots(subSessionId, bots);
  return spins;
}

export { BOT_NAMES };
