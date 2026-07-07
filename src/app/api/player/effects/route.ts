import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActiveEffect } from "@/stores/useEffectsStore";

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

  // Verify that the authenticated user is either requesting their own effects or has admin access
  if (userId !== user!.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Verify user is in the session
  const { data: playerInSession } = await admin
    .from("sub_session_players")
    .select("id")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", userId)
    .single();

  if (!playerInSession) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  // Fetch active effects for the player
  // This assumes a player_effects table exists
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
    type: "shield" | "cloak" | "multiplier" | "insurance";
    name: string;
    duration_ms: number;
    started_at: string;
    expires_at: string;
    icon: string | null;
  }
  const formattedEffects: ActiveEffect[] = (effects || []).map((e: EffectRow) => ({
    id: e.id,
    type: e.type,
    name: e.name,
    duration_ms: e.duration_ms,
    started_at: e.started_at,
    expires_at: e.expires_at,
    icon: e.icon || "",
  }));

  return NextResponse.json({
    effects: formattedEffects,
    server_time: new Date().toISOString(),
  });
}
