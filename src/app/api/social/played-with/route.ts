import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data } = await supabase
    .from("session_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const playedWith = new Map<string, { username: string; sessions: number }>();

  for (const history of data ?? []) {
    const teammates = (history.teammates as { userId: string; username: string }[]) ?? [];
    for (const tm of teammates) {
      if (tm.userId === user!.id) continue;
      const existing = playedWith.get(tm.userId);
      if (existing) {
        existing.sessions += 1;
      } else {
        playedWith.set(tm.userId, { username: tm.username, sessions: 1 });
      }
    }
  }

  return NextResponse.json({
    playedWith: Array.from(playedWith.entries()).map(([userId, info]) => ({
      userId,
      ...info,
    })),
  });
}
