import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { AVATARS } from "@/types/gameplay";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { avatarId, referralCode } = await request.json();

  if (!avatarId || !AVATARS.some((a) => a.id === avatarId)) {
    return NextResponse.json({ error: "Invalid avatar" }, { status: 400 });
  }

  const admin = createAdminClient();

  let campId: string | null = null;

  if (referralCode) {
    const { data: camp } = await admin
      .from("camps")
      .select("id")
      .eq("referral_code", referralCode)
      .single();
    campId = camp?.id ?? null;
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
    const username =
      (user!.user_metadata?.username as string | undefined) ??
      `phantom_${user!.id.slice(0, 8)}`;

    const { error: insertError } = await admin.from("profiles").insert({
      id: user!.id,
      username,
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
