"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";

type AuthState = "loading" | "ready" | "unauthenticated" | "forbidden";

interface AuthGateProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "camp_owner";
  requireOwnedCamp?: boolean;
  forbiddenMessage?: string;
}

export function AuthGate({
  children,
  requiredRole,
  requireOwnedCamp,
  forbiddenMessage,
}: AuthGateProps) {
  const router = useRouter();
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

      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (cancelled) return;

      if (!res.ok) {
        setState("unauthenticated");
        router.replace("/login");
        return;
      }

      const data = await res.json();
      const user = data.user as {
        role?: string;
        is_banned?: boolean;
      } | null;

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
        const campRes = await fetch("/api/camp-owner/camp", { credentials: "same-origin" });
        if (cancelled) return;

        if (!campRes.ok) {
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

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-phantom-muted">Verifying access...</p>
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <h1 className="font-display text-2xl font-bold">Access Denied</h1>
        <p className="text-sm text-phantom-muted">{message}</p>
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="text-sm text-phantom-gold hover:underline"
        >
          ← Back to player app
        </button>
      </div>
    );
  }

  if (state === "unauthenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-phantom-muted">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
