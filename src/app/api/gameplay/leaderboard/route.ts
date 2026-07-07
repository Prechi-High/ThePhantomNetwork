import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardEntry, SquadLeaderboardEntry } from "@/stores/useLeaderboardStore";

/**
 * GET /api/gameplay/leaderboard
 * Returns leaderboard data for a session
 *
 * Query params:
 * - subSessionId: required
 * - type: optional, 'individual' or 'squad', default 'individual'
 */
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const subSessionId = url.searchParams.get("subSessionId");
  const type = url.searchParams.get("type") || "individual";

  if (!subSessionId) {
    return NextResponse.json({ error: "subSessionId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify user is in the session
  const { data: playerInSession } = await admin
    .from("sub_session_players")
    .select("id")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!playerInSession) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  if (type === "squad") {
    // Fetch squad leaderboard
    const { data: squads } = await admin
      .from("squad_leaderboard_snapshots")
      .select(`
        rank,
        squad_id,
        squad_name,
        squad_tokens,
        member_count,
        leader_name
      `)
      .eq("sub_session_id", subSessionId)
      .order("rank", { ascending: true });

    const formattedSquads: SquadLeaderboardEntry[] = (squads || []).map((s: {
      rank: number;
      squad_id: string;
      squad_name: string;
      squad_tokens: number;
      member_count: number;
      leader_name: string;
    }) => ({
      rank: s.rank,
      squad_id: s.squad_id,
      squad_name: s.squad_name,
      squad_tokens: s.squad_tokens,
      member_count: s.member_count,
      leader_name: s.leader_name,
    }));

    return NextResponse.json({
      squad_leaderboard: formattedSquads,
    });
  }

  // Fetch individual leaderboard
  const { data: players } = await admin
    .from("sub_session_players")
    .select(`
      user_id,
      session_tokens,
      squad_id,
      is_eliminated,
      profiles(username),
      squads(name)
    `)
    .eq("sub_session_id", subSessionId)
    .order("session_tokens", { ascending: false });

  // Calculate ranks
  interface PlayerRow {
    user_id: string;
    session_tokens: number;
    squad_id: string;
    is_eliminated: boolean;
    profiles?: Array<{ username: string }> | null;
    squads?: Array<{ name: string }> | null;
  }
  const leaderboard: LeaderboardEntry[] = (players as PlayerRow[] || [])
    .map((player: PlayerRow, index: number) => ({
      rank: index + 1,
      user_id: player.user_id,
      username: (player.profiles && player.profiles[0]?.username) || "Player",
      session_tokens: player.session_tokens,
      squad_id: player.squad_id,
      squad_name: (player.squads && player.squads[0]?.name) || "",
      alive: !player.is_eliminated,
      position: { x: 0.5, y: 0.5 }, // Default position, can be extended if needed
    }));

  return NextResponse.json({
    leaderboard,
  });
}
