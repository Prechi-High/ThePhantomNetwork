import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildStealTargets, isEligibleStealTarget } from "@/lib/gameplay/steal";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId } = await request.json();
  const admin = createAdminClient();

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*, profiles(username)")
    .eq("sub_session_id", subSessionId)
    .eq("is_eliminated", false);

  const { data: rivalries } = await admin
    .from("rivalries")
    .select("*")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`);

  const rivalIds = new Set(
    (rivalries ?? []).map((r) => (r.user_a === user!.id ? r.user_b : r.user_a))
  );

  const candidates = (players ?? [])
    .filter((p) =>
      isEligibleStealTarget(
        {
          userId: p.user_id,
          tokens: Number(p.session_tokens),
          isEliminated: p.is_eliminated,
          shieldCount: p.shield_count,
          cloakActive: p.cloak_active,
        },
        user!.id
      )
    )
    .map((p) => ({
      userId: p.user_id,
      username: (p.profiles as { username: string })?.username ?? "Unknown",
      tokens: Number(p.session_tokens),
      tokenScore: Number(p.session_tokens),
      rivalryScore: rivalIds.has(p.user_id) ? 100 : 0,
      recentStealScore: 0,
    }));

  const targets = buildStealTargets(candidates, rivalIds);

  return NextResponse.json({ targets });
}
