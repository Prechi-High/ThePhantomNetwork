import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/api/admin-auth";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");
  const area = searchParams.get("area");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 500);

  const admin = createAdminClient();
  let query = admin
    .from("app_errors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (severity) query = query.eq("severity", severity);
  if (area) query = query.eq("area", area);

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const { count: total } = await admin
    .from("app_errors")
    .select("*", { count: "exact", head: true });

  const { count: critical } = await admin
    .from("app_errors")
    .select("*", { count: "exact", head: true })
    .eq("severity", "critical")
    .eq("resolved", false);

  return NextResponse.json({
    errors: data ?? [],
    stats: { total: total ?? 0, unresolvedCritical: critical ?? 0 },
  });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id, clearAll } = await request.json().catch(() => ({}));
  const admin = createAdminClient();

  if (clearAll) {
    await admin.from("app_errors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return NextResponse.json({ success: true });
  }

  if (id) {
    await admin.from("app_errors").update({ resolved: true }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "id or clearAll required" }, { status: 400 });
}
