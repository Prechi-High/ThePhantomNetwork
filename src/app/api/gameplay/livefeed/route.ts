import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedEvent } from "@/stores/useLiveFeedStore";

/**
 * GET /api/gameplay/livefeed
 * Returns recent live feed events for a session
 *
 * Query params:
 * - subSessionId: required
 * - limit: optional, default 50, max 100
 */
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const subSessionId = url.searchParams.get("subSessionId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  if (!subSessionId) {
    return NextResponse.json({ error: "subSessionId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: playerInSession } = await admin
    .from("sub_session_players")
    .select("id")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!playerInSession) {
    return NextResponse.json({ error: "Not in sub-session" }, { status: 403 });
  }

  const { data: rows } = await admin
    .from("live_feed_events")
    .select("id, event_type, message, metadata, created_at")
    .contains("metadata", { subSessionId })
    .order("created_at", { ascending: false })
    .limit(limit);

  interface LiveFeedRow {
    id: string;
    event_type: string;
    message: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }

  const formattedEvents: FeedEvent[] = (rows ?? []).map((row: LiveFeedRow) => {
    const stored = row.metadata?.feedEvent as FeedEvent | undefined;
    if (stored?.id && stored?.type) {
      return stored;
    }
    return {
      id: row.id,
      type: (row.event_type as FeedEvent["type"]) ?? "announcement",
      timestamp: row.created_at,
      actor: {
        user_id: (row.metadata?.userId as string) ?? "system",
        username: "System",
        avatar: "",
      },
      details: { message: row.message, ...(row.metadata ?? {}) },
    };
  });

  return NextResponse.json({
    events: formattedEvents.reverse(),
  });
}
