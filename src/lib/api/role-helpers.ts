import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/gameplay";
import { getAuthUser } from "./auth-helpers";
import { requireAdminSession } from "./admin-auth";

export async function getProfileForUser(userId: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*, camps(id, name, owner_id)")
    .eq("id", userId)
    .single();
  return profile;
}

export async function requireRole(allowed: UserRole[]) {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile || profile.is_banned) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: "Account restricted" }, { status: 403 }),
    };
  }

  if (!allowed.includes(profile.role as UserRole)) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, profile, error: null };
}

export async function requireAdmin() {
  return requireAdminSession();
}

export async function requireCampOwner() {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      profile: null,
      camp: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile || profile.is_banned) {
    return {
      user: null,
      profile: null,
      camp: null,
      error: NextResponse.json({ error: "Account restricted" }, { status: 403 }),
    };
  }

  const admin = createAdminClient();
  const { data: camp } = await admin
    .from("camps")
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!camp) {
    return {
      user: null,
      profile: null,
      camp: null,
      error: NextResponse.json({ error: "No camp assigned" }, { status: 403 }),
    };
  }

  return { user, profile, camp, error: null };
}

export async function verifyAdminOrCron(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const { error } = await requireAdminSession();
  return !error;
}
