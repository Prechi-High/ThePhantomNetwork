import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ available: false, error: "Username required" }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({
      available: false,
      error: "Username must be 3–20 characters (letters, numbers, underscore)",
    });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  return NextResponse.json({ available: !data, username });
}
