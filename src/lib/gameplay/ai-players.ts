/**
 * AI bot state stored in Redis (avoids auth.users FK requirement).
 */

import { redisGet, redisSet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

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
}

function botsKey(subSessionId: string) {
  return `sub:${subSessionId}:ai_bots`;
}

export async function seedAiBotsForSession(
  sessionId: string,
  botCount: number
): Promise<void> {
  // Stored on session via economy_config at create time — no-op here
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
      tokens: 0,
      isEliminated: false,
    });
  }
  await redisSet(botsKey(subSessionId), bots, 3600);
  return bots;
}

export async function getBots(subSessionId: string): Promise<AiBot[]> {
  return (await redisGet<AiBot[]>(botsKey(subSessionId))) ?? [];
}

export async function runBotSpinTick(subSessionId: string): Promise<number> {
  const bots = await getBots(subSessionId);
  if (!bots.length) return 0;

  let spins = 0;
  for (const bot of bots) {
    if (bot.isEliminated) continue;
    if (Math.random() > 0.35) continue;
    const outcomes = [3, 1, 0.5, 0];
    const gain = outcomes[Math.floor(Math.random() * outcomes.length)];
    bot.tokens = Math.round((bot.tokens + gain) * 10) / 10;
    spins++;
  }

  await redisSet(botsKey(subSessionId), bots, 3600);
  return spins;
}

export { BOT_NAMES };
