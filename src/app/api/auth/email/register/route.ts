import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueSessionForEmail } from "@/lib/supabase/issue-session";
import { verifyRecaptcha, hashToken } from "@/lib/captcha";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, password, username, captchaToken } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!captchaToken) {
        return NextResponse.json({ error: "Captcha verification required" }, { status: 400 });
      }
      const valid = await verifyRecaptcha(captchaToken);
      if (!valid) {
        return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
      }
    }

    const admin = createAdminClient();
    const displayName =
      (typeof username === "string" && username.trim()) ||
      normalizedEmail.split("@")[0];

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: { username: displayName },
    });

    if (createError) {
      const msg = createError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!created.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    const userId = created.user.id;

    await admin
      .from("profiles")
      .update({ username: displayName })
      .eq("id", userId);

    if (captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      const ip = request.headers.get("x-forwarded-for") ?? "unknown";
      await admin.from("captcha_verifications").insert({
        user_id: userId,
        token_hash: hashToken(captchaToken),
        ip_hash: hashToken(ip),
      });
      await admin
        .from("profiles")
        .update({ captcha_verified_at: new Date().toISOString() })
        .eq("id", userId);
    }

    const { session, error: sessionError } = await issueSessionForEmail(normalizedEmail);

    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError?.message ?? "Session failed" }, { status: 500 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
      onboardingComplete: profile?.onboarding_complete ?? false,
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
