import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampOwnerNav } from "@/components/camp-owner/CampOwnerNav";

export default async function CampOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned) redirect("/home");

  const { data: ownedCamp } = await supabase
    .from("camps")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!ownedCamp && profile.role !== "camp_owner") {
    redirect("/home");
  }

  if (!ownedCamp) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-phantom-bg">
      <CampOwnerNav />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
