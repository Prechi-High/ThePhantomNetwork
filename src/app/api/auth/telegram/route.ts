import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateTelegramInitData, parseTelegramUser } from "@/lib/telegram/validateInitData";
import { issueSessionForEmail } from "@/lib/supabase/issue-session";

export async function POST(request: Request) {
  const { initData } = await request.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const isDev = process.env.NODE_ENV === "development";

  if (!initData) {
    return NextResponse.json({ error: "Missing initData" }, { status: 400 });
  }

  if (botToken && !validateTelegramInitData(initData, botToken)) {
    return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 });
  }

  if (!botToken && !isDev) {
    return NextResponse.json({ error: "Telegram bot not configured" }, { status: 503 });
  }

  const tgUser = parseTelegramUser(initData);
  if (!tgUser) {
    return NextResponse.json({ error: "No user in init data" }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = `telegram_${tgUser.id}@phantom.local`;

  let userId: string;
  let isNew = false;

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("telegram_id", tgUser.id)
    .single();

  if (existing) {
    userId = existing.id;
  } else {
    const { data: byEmail } = await admin.auth.admin.listUsers();
    const found = byEmail.users.find((u) => u.email === email);

    if (found) {
      userId = found.id;
      await admin
        .from("profiles")
        .update({
          telegram_id: tgUser.id,
          username: tgUser.username ?? `phantom_${tgUser.id}`,
        })
        .eq("id", userId);
    } else {
      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          username: tgUser.username ?? `phantom_${tgUser.id}`,
          telegram_id: tgUser.id,
        },
      });

      if (authError || !authUser.user) {
        return NextResponse.json({ error: authError?.message ?? "Create failed" }, { status: 500 });
      }

      userId = authUser.user.id;
      isNew = true;

      await admin
        .from("profiles")
        .update({
          telegram_id: tgUser.id,
          username: tgUser.username ?? `phantom_${tgUser.id}`,
        })
        .eq("id", userId);
    }
  }

  const { session, error: sessionError } = await issueSessionForEmail(email);

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message ?? "Session failed" }, { status: 500 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    userId,
    isNew,
    onboardingComplete: profile?.onboarding_complete ?? false,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    },
  });
}
