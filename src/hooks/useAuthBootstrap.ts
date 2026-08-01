"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";
import { authNetwork } from "@/lib/network";

type AuthState = "loading" | "ready" | "unauthenticated" | "forbidden";

interface UseAuthBootstrapOptions {
  requiredRole?: "admin" | "camp_owner";
  requireOwnedCamp?: boolean;
  forbiddenMessage?: string;
}

export function useAuthBootstrap(options: UseAuthBootstrapOptions = {}) {
  const router = useRouter();
  const { requiredRole, requireOwnedCamp, forbiddenMessage } = options;
  const [state, setState] = useState<AuthState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          await establishSession(session.access_token, session.refresh_token);
        } catch {
          // Browser session exists; continue with API check
        }
      }

      const meResult = await authNetwork.getMe();
      if (cancelled) return;

      if (!meResult.ok) {
        setState("unauthenticated");
        router.replace("/login");
        return;
      }

      const user = (meResult.data as { user?: { role?: string; is_banned?: boolean } }).user;

      if (!user || user.is_banned) {
        setState("unauthenticated");
        router.replace("/login");
        return;
      }

      if (requiredRole === "admin" && user.role !== "admin") {
        setState("forbidden");
        setMessage(
          forbiddenMessage ??
            "Admin access required. Ask a platform admin to run: UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';"
        );
        return;
      }

      if (requiredRole === "camp_owner" || requireOwnedCamp) {
        const campResult = await authNetwork.getCampOwnerCamp();
        if (cancelled) return;

        if (!campResult.ok) {
          setState("forbidden");
          setMessage(
            forbiddenMessage ??
              "Camp owner access required. An admin must assign you as owner of a camp in Admin → Camps."
          );
          return;
        }
      }

      setState("ready");
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router, requiredRole, requireOwnedCamp, forbiddenMessage]);

  return { state, message };
}
