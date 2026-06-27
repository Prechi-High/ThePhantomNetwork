"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";

/** Keeps httpOnly cookies in sync with the browser Supabase session (Telegram Mini App). */
export function SessionBootstrap() {
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        establishSession(session.access_token, session.refresh_token).catch(() => {});
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        establishSession(session.access_token, session.refresh_token).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
