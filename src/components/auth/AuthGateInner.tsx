"use client";

import { useRouter } from "next/navigation";

type AuthState = "loading" | "ready" | "unauthenticated" | "forbidden";

interface AuthGateInnerProps {
  children: React.ReactNode;
  state: AuthState;
  message: string;
}

export function AuthGateInner({ children, state, message }: AuthGateInnerProps) {
  const router = useRouter();

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
