import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { AVATARS } from "@/types/gameplay";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { avatarId, referralCode, username, campId: requestedCampId } = await request.json();

  if (!avatarId || !AVATARS.some((a) => a.id === avatarId)) {
    return NextResponse.json({ error: "Invalid avatar" }, { status: 400 });
  }

  if (!username || typeof username !== "string" || !USERNAME_RE.test(username.trim())) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters (letters, numbers, underscore)" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: existingUsername } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username.trim())
    .neq("id", user!.id)
    .maybeSingle();

  if (existingUsername) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  let campId: string | null = requestedCampId ?? null;

  if (referralCode) {
    const { data: camp } = await admin
      .from("camps")
      .select("id")
      .eq("referral_code", referralCode)
      .single();
    campId = camp?.id ?? campId;
  }

  if (campId) {
    const { data: campExists } = await admin.from("camps").select("id").eq("id", campId).maybeSingle();
    if (!campExists) {
      return NextResponse.json({ error: "Invalid camp" }, { status: 400 });
    }
  }

  if (!campId) {
    const { data: defaultCamp } = await admin
      .from("camps")
      .select("id")
      .eq("is_default", true)
      .single();
    campId = defaultCamp?.id ?? null;
  }

  const profilePayload = {
    username: username.trim(),
    avatar_id: avatarId,
    camp_id: campId,
    onboarding_complete: true,
    wallet_balance_cents: 5000,
  };

  const { data: updated } = await admin
    .from("profiles")
    .update(profilePayload)
    .eq("id", user!.id)
    .select("id")
    .maybeSingle();

  if (!updated) {
    const { error: insertError } = await admin.from("profiles").insert({
      id: user!.id,
      ...profilePayload,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  if (campId) {
    const { data: camp } = await admin
      .from("camps")
      .select("member_count")
      .eq("id", campId)
      .single();
    if (camp) {
      await admin
        .from("camps")
        .update({ member_count: camp.member_count + 1 })
        .eq("id", campId);
    }
  }

  return NextResponse.json({ success: true, campId });
}
