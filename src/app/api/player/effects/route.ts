import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redisGet } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import { buildActiveEffectFromArmed } from "@/lib/gameplay/tactical-effects";
import type { ActiveEffect } from "@/stores/useEffectsStore";
import type { TacticalAssetSlug } from "@/types/gameplay";

interface ArmedState {
  assetSlug: TacticalAssetSlug;
  expiresAt: number;
}

/**
 * GET /api/player/effects
 * Returns active effects for a player in a session
 *
 * Query params:
 * - userId: required
 * - subSessionId: required
 */
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const subSessionId = url.searchParams.get("subSessionId");

  if (!userId || !subSessionId) {
    return NextResponse.json({ error: "userId and subSessionId required" }, { status: 400 });
  }

  if (userId !== user!.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const { data: playerInSession } = await admin
    .from("sub_session_players")
    .select("id, cloak_active, cloak_expires_at")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", userId)
    .single();

  if (!playerInSession) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  const formattedEffects: ActiveEffect[] = [];

  try {
    const { data: effects } = await admin
      .from("player_effects")
      .select(`
        id,
        type,
        name,
        duration_ms,
        started_at,
        expires_at,
        icon
      `)
      .eq("user_id", userId)
      .eq("sub_session_id", subSessionId)
      .filter("expires_at", "gt", new Date().toISOString());

    interface EffectRow {
      id: string;
      type: ActiveEffect["type"];
      name: string;
      duration_ms: number;
      started_at: string;
      expires_at: string;
      icon: string | null;
    }

    for (const e of (effects || []) as EffectRow[]) {
      formattedEffects.push({
        id: e.id,
        type: e.type,
        name: e.name,
        duration_ms: e.duration_ms,
        started_at: e.started_at,
        expires_at: e.expires_at,
        icon: e.icon || "",
      });
    }
  } catch {
    // player_effects table may not exist — fall back to Redis/player state
  }

  const armed = await redisGet<ArmedState>(redisKeys.tacticalArmed(subSessionId, userId));
  if (armed?.assetSlug && armed.expiresAt > now) {
    const armedEffect = buildActiveEffectFromArmed(armed.assetSlug, armed.expiresAt);
    if (armedEffect && !formattedEffects.some((e) => e.type === armedEffect.type)) {
      formattedEffects.push(armedEffect);
    }
  }

  if (
    playerInSession.cloak_active &&
    playerInSession.cloak_expires_at &&
    new Date(playerInSession.cloak_expires_at).getTime() > now
  ) {
    const veilDef = TACTICAL_ASSET_DEFS.veil;
    const expiresAt = new Date(playerInSession.cloak_expires_at).toISOString();
    if (!formattedEffects.some((e) => e.type === "cloak")) {
      formattedEffects.push({
        id: `cloak-${expiresAt}`,
        type: "cloak",
        name: veilDef.displayName,
        duration_ms: veilDef.durationMs,
        started_at: new Date(new Date(expiresAt).getTime() - veilDef.durationMs).toISOString(),
        expires_at: expiresAt,
        icon: veilDef.icon,
      });
    }
  }

  return NextResponse.json({
    effects: formattedEffects,
    server_time: new Date().toISOString(),
  });
}
