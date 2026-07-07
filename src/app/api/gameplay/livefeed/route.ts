import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedEventActor, FeedEventTarget, FeedEvent } from "@/stores/useLiveFeedStore";

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

  // Fetch recent livefeed events
  // This assumes a livefeed_events table exists with the structure from the schema
  const { data: events } = await admin
    .from("livefeed_events")
    .select(`
      id,
      type,
      timestamp,
      actor_id,
      actor_name,
      actor_avatar,
      target_id,
      target_name,
      details
    `)
    .eq("sub_session_id", subSessionId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  // Transform to frontend format
  interface LiveFeedEventRow {
    id: string;
    type: string;
    timestamp: string;
    actor_id: string;
    actor_name: string;
    actor_avatar: string | null;
    target_id: string | null;
    target_name: string | null;
    details: Record<string, unknown> | null;
  }
  const formattedEvents: FeedEvent[] = (events || []).map((event: LiveFeedEventRow) => ({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    actor: {
      user_id: event.actor_id,
      username: event.actor_name,
      avatar: event.actor_avatar || "",
    } as FeedEventActor,
    target: event.target_id
      ? ({
          user_id: event.target_id,
          username: event.target_name,
        } as FeedEventTarget)
      : undefined,
    details: event.details || {},
  }));

  return NextResponse.json({
    events: formattedEvents.reverse(), // Return oldest first so newest is first when displayed
  });
}
