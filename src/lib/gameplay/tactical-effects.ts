import { createAdminClient } from "@/lib/supabase/admin";
import { emitEffectActivated, emitLiveFeedEvent } from "@/lib/realtime/event-emitter";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import type { ActiveEffect, EffectType } from "@/stores/useEffectsStore";
import type { TacticalAssetSlug } from "@/types/gameplay";

const SLUG_TO_EFFECT_TYPE: Partial<Record<TacticalAssetSlug, EffectType>> = {
  guardian: "shield",
  veil: "cloak",
  counterstrike: "insurance",
};

export async function applyTacticalEffectFeedback(
  subSessionId: string,
  userId: string,
  username: string,
  assetSlug: TacticalAssetSlug
): Promise<ActiveEffect> {
  const def = TACTICAL_ASSET_DEFS[assetSlug];
  const now = Date.now();
  const startedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + def.durationMs).toISOString();
  const effectType = SLUG_TO_EFFECT_TYPE[assetSlug] ?? "boost";

  const effectId = crypto.randomUUID();
  const effect: ActiveEffect = {
    id: effectId,
    type: effectType,
    name: def.displayName,
    duration_ms: def.durationMs,
    started_at: startedAt,
    expires_at: expiresAt,
    icon: def.icon,
  };

  try {
    const admin = createAdminClient();
    await admin.from("player_effects").insert({
      id: effect.id,
      user_id: userId,
      sub_session_id: subSessionId,
      type: effect.type,
      name: effect.name,
      duration_ms: effect.duration_ms,
      started_at: effect.started_at,
      expires_at: effect.expires_at,
      icon: effect.icon,
    });
  } catch {
    // Table may not exist yet — SSE still updates the HUD
  }

  await emitEffectActivated(subSessionId, userId, effect);
  await emitLiveFeedEvent(subSessionId, {
    id: effect.id,
    type: "effect",
    timestamp: startedAt,
    actor: {
      user_id: userId,
      username,
      avatar: "",
    },
    details: { effect: assetSlug },
  });

  return effect;
}
