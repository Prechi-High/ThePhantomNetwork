import { createClient } from "@/lib/supabase/client";

export async function establishSession(access_token: string, refresh_token: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ access_token, refresh_token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to establish session");
  }

  const supabase = createClient();
  await supabase.auth.setSession({ access_token, refresh_token });
}
