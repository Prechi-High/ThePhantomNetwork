import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*, camps(*)")
    .eq("id", user!.id)
    .single();

  return NextResponse.json({
    user: profile,
    onboardingComplete: profile?.onboarding_complete ?? false,
    captchaVerified: !!profile?.captcha_verified_at,
  });
}
