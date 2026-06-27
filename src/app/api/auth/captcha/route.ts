import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRecaptcha, hashToken } from "@/lib/captcha";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { token, userId } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Captcha token required" }, { status: 400 });
  }

  const valid = await verifyRecaptcha(token);
  if (!valid) {
    return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetUserId = userId ?? user?.id;
  if (!targetUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const ipHash = hashToken(ip);

  await admin.from("captcha_verifications").insert({
    user_id: targetUserId,
    token_hash: tokenHash,
    ip_hash: ipHash,
  });

  await admin
    .from("profiles")
    .update({ captcha_verified_at: new Date().toISOString() })
    .eq("id", targetUserId);

  return NextResponse.json({ verified: true });
}
