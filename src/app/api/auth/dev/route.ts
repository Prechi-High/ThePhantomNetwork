import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const admin = createAdminClient();
  const email = "dev@phantom.local";

  const { data: users } = await admin.auth.admin.listUsers();
  let user = users.users.find((u) => u.email === email);

  if (!user) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { username: "dev_phantom" },
    });
    if (error || !created.user) {
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }
    user = created.user;
    await admin.from("captcha_verifications").insert({
      user_id: user.id,
      token_hash: "dev-bypass",
      ip_hash: "dev",
    });
    await admin
      .from("profiles")
      .update({ captcha_verified_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  const { data: sessionData, error: sessionError } =
    await admin.auth.admin.createSession({ user_id: user.id });

  if (sessionError || !sessionData.session) {
    return NextResponse.json({ error: sessionError?.message }, { status: 500 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    },
    onboardingComplete: profile?.onboarding_complete ?? false,
  });
}
