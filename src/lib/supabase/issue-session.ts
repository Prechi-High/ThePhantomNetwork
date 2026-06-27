import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function issueSessionForEmail(email: string) {
  const admin = createAdminClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    return { session: null, error: linkError ?? new Error("Failed to generate auth link") };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });

  if (verifyError || !sessionData.session) {
    return { session: null, error: verifyError ?? new Error("Failed to verify session") };
  }

  return { session: sessionData.session, error: null };
}
