import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/role-helpers";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("id, username, role, level, camp_id, is_banned, wallet_balance_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.ilike("username", `%${q}%`);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { userId, role, is_banned, ban_reason } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};

  if (role) updates.role = role;
  if (is_banned != null) updates.is_banned = is_banned;
  if (ban_reason !== undefined) updates.ban_reason = ban_reason;

  const { data, error: updateError } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
