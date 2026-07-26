import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redisSet, redisGet, redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { publishLiveFeed } from "@/lib/api/rate-limit";
import { applyTacticalEffectFeedback } from "@/lib/gameplay/tactical-effects";
import { consumeSessionAsset } from "@/lib/armory/service";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import { LIVE_FEED_TEMPLATES } from "@/lib/brand/terminology";
import type { TacticalAssetSlug } from "@/types/gameplay";

interface ArmedState {
  assetSlug: TacticalAssetSlug;
  expiresAt: number;
  targetId?: string;
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, sessionId, assetSlug, targetId } = await request.json();
  const slug = assetSlug as TacticalAssetSlug;
  const def = TACTICAL_ASSET_DEFS[slug];

  if (!def) {
    return NextResponse.json({ error: "Unknown tactical asset" }, { status: 400 });
  }
  if (def.requiresTarget && !targetId) {
    return NextResponse.json({ error: "Target required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: player } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!player || player.is_eliminated) {
    return NextResponse.json({ error: "Not an active player" }, { status: 403 });
  }

  const consumed = await consumeSessionAsset(user!.id, sessionId, slug);
  if (!consumed) {
    return NextResponse.json({ error: "No charges remaining" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("username")
    .eq("id", user!.id)
    .single();

  const username = profile?.username ?? "Player";
  const armedKey = redisKeys.tacticalArmed(subSessionId, user!.id);
  const now = Date.now();

  switch (slug) {
    case "guardian": {
      await admin
        .from("sub_session_players")
        .update({ shield_count: (player.shield_count ?? 0) + 1 })
        .eq("id", player.id);
      await redisSet(
        armedKey,
        { assetSlug: slug, expiresAt: now + def.durationMs } satisfies ArmedState,
        Math.ceil(def.durationMs / 1000)
      );
      await applyTacticalEffectFeedback(subSessionId, user!.id, username, slug);
      break;
    }
    case "veil": {
      await admin
        .from("sub_session_players")
        .update({
          cloak_active: true,
          cloak_expires_at: new Date(now + def.durationMs).toISOString(),
        })
        .eq("id", player.id);
      await applyTacticalEffectFeedback(subSessionId, user!.id, username, slug);
      break;
    }
    case "counterstrike": {
      await redisSet(
        armedKey,
        { assetSlug: slug, expiresAt: now + def.durationMs } satisfies ArmedState,
        Math.ceil(def.durationMs / 1000)
      );
      await applyTacticalEffectFeedback(subSessionId, user!.id, username, slug);
      break;
    }
    case "intercept": {
      const { data: target } = await admin
        .from("sub_session_players")
        .select("shield_count")
        .eq("sub_session_id", subSessionId)
        .eq("user_id", targetId)
        .single();
      if (target && target.shield_count > 0) {
        await admin
          .from("sub_session_players")
          .update({ shield_count: Math.max(0, target.shield_count - 1) })
          .eq("sub_session_id", subSessionId)
          .eq("user_id", targetId);
      }
      await publishLiveFeed("effect", LIVE_FEED_TEMPLATES.interceptSuccess(username), {
        effect: slug,
        targetId,
        userId: user!.id,
        subSessionId,
      });
      break;
    }
    case "disrupt": {
      await redisSet(
        redisKeys.tacticalDebuff(subSessionId, targetId),
        { disruptUntil: now + def.durationMs, sourceId: user!.id },
        Math.ceil(def.durationMs / 1000)
      );
      await publishLiveFeed("effect", LIVE_FEED_TEMPLATES.disruptInitiated(username), {
        effect: slug,
        targetId,
        userId: user!.id,
        subSessionId,
      });
      break;
    }
    case "mark": {
      await redisSet(
        redisKeys.tacticalMark(subSessionId),
        { targetId, markedBy: user!.id, expiresAt: now + def.durationMs },
        Math.ceil(def.durationMs / 1000)
      );
      await publishLiveFeed("effect", LIVE_FEED_TEMPLATES.markPlaced(username), {
        effect: slug,
        targetId,
        userId: user!.id,
        subSessionId,
      });
      break;
    }
  }

  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "tactical_activated",
    userId: user!.id,
    assetSlug: slug,
    targetId,
  });

  return NextResponse.json({ success: true, assetSlug: slug });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subSessionId = url.searchParams.get("subSessionId");
  const userId = url.searchParams.get("userId");
  if (!subSessionId || !userId) {
    return NextResponse.json({ error: "subSessionId and userId required" }, { status: 400 });
  }
  const armed = await redisGet<ArmedState>(redisKeys.tacticalArmed(subSessionId, userId));
  return NextResponse.json({ armed });
}
