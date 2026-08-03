"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ScreenStateVariant =
  | "loading"
  | "empty"
  | "live"
  | "success"
  | "error"
  | "offline"
  | "first-time"
  | "returning";

interface ScreenStateProps {
  variant: ScreenStateVariant;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

const defaults: Record<ScreenStateVariant, { title: string; message: string }> = {
  loading: { title: "Loading", message: "Synchronizing with the world…" },
  empty: { title: "Nothing here yet", message: "Check back soon — the world is always moving." },
  live: { title: "Live", message: "Real-time data connected." },
  success: { title: "Success", message: "Action completed." },
  error: { title: "Something went wrong", message: "Please try again in a moment." },
  offline: { title: "You're offline", message: "Reconnect to continue." },
  "first-time": { title: "Welcome", message: "Your journey begins now." },
  returning: { title: "Welcome back", message: "The world moved while you were away." },
};

export function ScreenState({ variant, title, message, action, className }: ScreenStateProps) {
  const copy = defaults[variant];
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}>
      {variant === "loading" && <Loader2 className="h-8 w-8 animate-spin text-legacy-gold" />}
      <h2 className="text-xl font-bold text-white">{title ?? copy.title}</h2>
      <p className="max-w-sm text-sm text-legacy-muted">{message ?? copy.message}</p>
      {action}
    </div>
  );
}
