import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SkillInInventory } from "@/stores/useInventoryStore";

/**
 * GET /api/player/inventory
 * Returns player skill inventory and cooldowns
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

  // Verify that the authenticated user is either requesting their own inventory or has admin access
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

  // Fetch player's owned skills
  // This assumes a player_skills table with ownership status
  const { data: ownedSkills } = await admin
    .from("player_skills")
    .select(`
      skill_id,
      skill_name,
      owned,
      charges,
      max_charges
    `)
    .eq("user_id", userId);

  // Fetch skill cooldowns
  const { data: cooldowns } = await admin
    .from("skill_cooldowns")
    .select(`
      skill_id,
      cooldown_until
    `)
    .eq("user_id", userId)
    .eq("sub_session_id", subSessionId)
    .filter("cooldown_until", "gt", new Date().toISOString());

  // Build cooldown map
  const cooldownMap = new Map<string, string>();
  (cooldowns || []).forEach((cd: any) => {
    cooldownMap.set(cd.skill_id, cd.cooldown_until);
  });

  // Default skill definitions
  const defaultSkills = [
    { id: "steal_boost", name: "Steal Boost" },
    { id: "shield", name: "Shield" },
    { id: "cloak", name: "Cloak" },
    { id: "multiplier", name: "Multiplier" },
    { id: "insurance", name: "Insurance" },
    { id: "revive", name: "Revive Token" },
  ];

  // Build skills list
  const ownedSkillMap = new Map<string, any>();
  (ownedSkills || []).forEach((skill: any) => {
    ownedSkillMap.set(skill.skill_id, skill);
  });

  const skills: SkillInInventory[] = defaultSkills.map((skill) => {
    const owned = ownedSkillMap.has(skill.id);
    const ownedData = ownedSkillMap.get(skill.id);
    const cooldownUntil = cooldownMap.get(skill.id);
    const isOnCooldown = cooldownUntil ? new Date(cooldownUntil) > new Date() : false;

    return {
      id: skill.id,
      name: skill.name,
      owned,
      available: owned && !isOnCooldown,
      cooldown_ms: isOnCooldown && cooldownUntil ? new Date(cooldownUntil).getTime() - Date.now() : 0,
      cooldown_until: cooldownUntil || null,
      charges: ownedData?.charges || 0,
      max_charges: ownedData?.max_charges || 1,
      icon: `/icons/skills/${skill.id}.png`,
    };
  });

  return NextResponse.json({
    skills,
    server_time: new Date().toISOString(),
  });
}
