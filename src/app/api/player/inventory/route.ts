import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionLoadoutSkills } from "@/lib/armory/service";
import { getAssetDisplayName } from "@/lib/brand/terminology";
import type { SkillInInventory } from "@/stores/useInventoryStore";

/**
 * GET /api/player/inventory
 * Returns player tactical asset charges for current session (from loadout state).
 */
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const subSessionId = url.searchParams.get("subSessionId");
  const sessionId = url.searchParams.get("sessionId");

  if (!userId || !subSessionId) {
    return NextResponse.json({ error: "userId and subSessionId required" }, { status: 400 });
  }

  if (userId !== user!.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: playerInSession } = await admin
    .from("sub_session_players")
    .select("id")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", userId)
    .single();

  if (!playerInSession) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  let loadoutItems: { assetSlug: string; quantity: number }[] = [];
  if (sessionId) {
    loadoutItems = await getSessionLoadoutSkills(userId, sessionId);
  }

  const skills: SkillInInventory[] = loadoutItems.map((item) => ({
    id: item.assetSlug,
    name: getAssetDisplayName(item.assetSlug),
    owned: item.quantity > 0,
    available: item.quantity > 0,
    cooldown_ms: 0,
    cooldown_until: null,
    charges: item.quantity,
    max_charges: item.quantity,
    icon: `/icons/skills/${item.assetSlug}.png`,
  }));

  return NextResponse.json({
    skills,
    server_time: new Date().toISOString(),
  });
}
