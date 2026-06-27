import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_feed_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ events: data ?? [] });
}
