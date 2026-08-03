import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SplashScreen } from "@/components/journey/SplashScreen";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <SplashScreen nextHref="/login" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_complete) {
    return <SplashScreen nextHref="/onboarding" />;
  }

  return <SplashScreen nextHref="/home" />;
}
