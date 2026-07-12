/**
 * GET /api/world/summary
 *
 * Returns a consolidated world state snapshot for:
 *   - World statistics (population signals)
 *   - World history (last 30 entries)
 *   - Camp momentum (top 10)
 *   - Active world events
 *   - Player rivalries (if userId provided)
 *   - Return summary (what happened since lastSeenAt)
 *   - Daily feature
 *
 * Query params:
 *   userId?     — personalizes rivalries and return summary
 *   lastSeenAt? — Unix ms timestamp for return summary
 *
 * Returns 200 with full world snapshot.
 * Independent failure — returns empty shells, never 500 for non-critical data.
 */

import { NextResponse }        from "next/server";
import { createAdminClient }   from "@/lib/supabase/admin";
import type { WorldStats }     from "@/lib/world/worldTimeline";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId     = searchParams.get("userId");
  const lastSeenAt = searchParams.get("lastSeenAt");

  const admin = createAdminClient();

  // ── Parallel data fetching (all non-critical, failures return null) ──

  const [statsResult, historyResult, campsResult, eventsResult] = await Promise.allSettled([
    fetchWorldStats(admin),
    fetchWorldHistory(admin),
    fetchCampMomentum(admin),
    fetchWorldEvents(admin),
  ]);

  const stats   = statsResult.status   === "fulfilled" ? statsResult.value   : null;
  const history = historyResult.status === "fulfilled" ? historyResult.value : [];
  const camps   = campsResult.status   === "fulfilled" ? campsResult.value   : [];
  const events  = eventsResult.status  === "fulfilled" ? eventsResult.value  : [];

  // ── Personal data (only if userId provided) ──

  let rivalries:   Awaited<ReturnType<typeof fetchRivalries>>   = [];
  let reputation:  Awaited<ReturnType<typeof fetchReputation>>  = null;
  let returnSummary = null;

  if (userId) {
    const [rivResult, repResult] = await Promise.allSettled([
      fetchRivalries(admin, userId),
      fetchReputation(admin, userId),
    ]);
    if (rivResult.status === "fulfilled") rivalries  = rivResult.value;
    if (repResult.status === "fulfilled") reputation = repResult.value;

    if (lastSeenAt) {
      const since = parseInt(lastSeenAt, 10);
      returnSummary = buildReturnSummary(history, since);
    }
  }

  // ── Daily feature (static for 24h, compute from top data) ──

  const dailyFeature = buildDailyFeature(camps);

  return NextResponse.json({
    stats,
    history: history.slice(0, 30),
    campMomentum: camps.slice(0, 10),
    worldEvents:  events,
    rivalries,
    reputation,
    returnSummary,
    dailyFeature,
  });
}

// ── Data fetchers ──────────────────────────────────────────────────────────

async function fetchWorldStats(admin: ReturnType<typeof createAdminClient>): Promise<WorldStats> {
  // Aggregate from multiple tables
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const hourAgo    = new Date(Date.now() - 3_600_000).toISOString();

  const [sessionsToday, activeSessions, recentSteals] = await Promise.all([
    admin.from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("updated_at", todayStart),
    admin.from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin.from("session_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "steal")
      .gte("created_at", hourAgo),
  ]);

  return {
    totalSessions:       0,
    sessionsToday:       sessionsToday.count ?? 0,
    activeSessions:      activeSessions.count ?? 0,
    playersOnline:       (activeSessions.count ?? 0) * 8,
    recentSteals:        recentSteals.count ?? 0,
    revivesToday:        0,
    championshipPlayers: 0,
    squadRecruiting:     0,
    updatedAt:           Date.now(),
  };
}

async function fetchWorldHistory(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("session_events")
    .select("id, event_type, payload, created_at")
    .in("event_type", ["elimination", "steal", "revive"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (!data) return [];

  return data.map((row) => ({
    id:        row.id,
    type:      row.event_type as "steal" | "revive" | "elimination",
    timestamp: new Date(row.created_at).getTime(),
    headline:  buildHeadline(row.event_type, row.payload as Record<string, unknown>),
    details:   row.payload,
  }));
}

async function fetchCampMomentum(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("camps")
    .select("id, name, member_count, leaderboard_score")
    .order("leaderboard_score", { ascending: false })
    .limit(10);

  if (!data) return [];

  return data.map((camp, i) => ({
    campId:         camp.id,
    campName:       camp.name,
    momentum:       Math.min(100, (camp.leaderboard_score ?? 0) / 100),
    trend:          "holding" as const,
    regionRank:     i + 1,
    rankDelta:      0,
    winStreak:      0,
    activeMembers:  camp.member_count ?? 0,
    weeklyTokens:   camp.leaderboard_score ?? 0,
    lastActivityAt: Date.now(),
  }));
}

async function fetchWorldEvents(_admin: ReturnType<typeof createAdminClient>) {
  // World events are configuration-driven — return empty for now
  // In production this would query a world_events table
  return [];
}

async function fetchRivalries(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await admin
    .from("session_events")
    .select("payload, created_at")
    .eq("event_type", "steal")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!data) return [];

  // Group by victim
  const map = new Map<string, { username: string; count: number; lastAt: number }>();
  for (const row of data) {
    const p = row.payload as Record<string, unknown>;
    const victimId = p?.victimId as string;
    if (!victimId) continue;
    const existing = map.get(victimId) ?? { username: "Unknown", count: 0, lastAt: 0 };
    map.set(victimId, {
      username: (p?.victimUsername as string) ?? "Unknown",
      count:    existing.count + 1,
      lastAt:   Math.max(existing.lastAt, new Date(row.created_at).getTime()),
    });
  }

  return Array.from(map.entries()).map(([rivalId, v]) => ({
    rivalId,
    rivalUsername:      v.username,
    stolenFrom:         v.count,
    stolenBy:           0,
    revivedThem:        0,
    revivedByThem:      0,
    yourScore:          v.count,
    theirScore:         0,
    sharedSessions:     0,
    daysActive:         Math.floor((Date.now() - v.lastAt) / 86_400_000),
    firstInteractionAt: v.lastAt,
    lastInteractionAt:  v.lastAt,
    status:             "active" as const,
  }));
}

async function fetchReputation(_admin: ReturnType<typeof createAdminClient>, _userId: string) {
  // Reputation is computed from behavior stats
  // In production this would query a player_stats table
  return null;
}

// ── Return summary builder ─────────────────────────────────────────────────

function buildReturnSummary(
  history: Array<{ type: string; timestamp: number; headline: string; id: string; isRecord?: boolean }>,
  since: number
) {
  const missed = history.filter((e) => e.timestamp > since);
  return {
    lastSeenAt:            since,
    sessionsCompleted:     missed.filter((e) => e.type === "session_completed").length,
    campRankChange:        0,
    rivalWins:             0,
    squadMembersRankedUp:  [] as string[],
    worldAnnouncements:    missed
      .filter((e) => ["camp_overtaken", "global_announcement"].includes(e.type))
      .slice(0, 5),
    worldRecords:          missed.filter((e) => e.isRecord).slice(0, 3),
    isReady:               true,
  };
}

// ── Daily feature builder ──────────────────────────────────────────────────

function buildDailyFeature(camps: Array<{ campId: string; campName: string; momentum: number }>) {
  const topCamp = camps[0];
  return topCamp
    ? { featuredCamp: { id: topCamp.campId, name: topCamp.campName, momentum: topCamp.momentum } }
    : {};
}

// ── Headline generator ─────────────────────────────────────────────────────

function buildHeadline(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case "steal":    return `${payload?.username ?? "A player"} executed a steal`;
    case "revive":   return `${payload?.username ?? "A player"} revived a teammate`;
    case "elimination": return `${payload?.username ?? "A player"} was eliminated`;
    default:         return `World event: ${type}`;
  }
}
