import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCampOwner } from "@/lib/api/role-helpers";

export async function GET() {
  const result = await requireCampOwner();
  if (result.error) return result.error;
  const { camp } = result;

  const admin = createAdminClient();

  const { data: campData } = await admin
    .from("camps")
    .select("name, referral_code, member_count")
    .eq("id", camp!.id)
    .single();

  const { count: referredCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("camp_id", camp!.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const referralLink = campData?.referral_code
    ? `${appUrl}/onboarding?ref=${campData.referral_code}`
    : null;

  return NextResponse.json({
    campName: campData?.name,
    referralCode: campData?.referral_code,
    referralLink,
    memberCount: referredCount ?? campData?.member_count ?? 0,
  });
}
