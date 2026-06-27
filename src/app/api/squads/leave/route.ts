import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();
  await admin.from("squad_members").delete().eq("user_id", user!.id);

  return NextResponse.json({ success: true });
}
