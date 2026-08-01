"use client";

import { AuthGateInner } from "@/components/auth/AuthGateInner";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";

interface AuthGateProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "camp_owner";
  requireOwnedCamp?: boolean;
  forbiddenMessage?: string;
}

export function AuthGate(props: AuthGateProps) {
  const { state, message } = useAuthBootstrap({
    requiredRole: props.requiredRole,
    requireOwnedCamp: props.requireOwnedCamp,
    forbiddenMessage: props.forbiddenMessage,
  });

  return <AuthGateInner state={state} message={message} {...props} />;
}
