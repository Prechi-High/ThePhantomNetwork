"use client";

import { useState } from "react";
import { PrimaryCTA } from "@/components/design-system";
import { Button } from "@/components/ui/Button";

type AuthMode = "login" | "register";

const inputCls =
  "w-full rounded-xl border border-[#f5b942]/30 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f5b942]/30";

interface EmailAuthSheetProps {
  open: boolean;
  onClose: () => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (v: string) => void;
  username: string;
  onUsernameChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailAuthSheet({
  open,
  onClose,
  mode,
  onModeChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  username,
  onUsernameChange,
  error,
  loading,
  onSubmit,
}: EmailAuthSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-t-2xl border border-[#f5b942]/30 bg-[#0B0F14] p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#f5b942]">
            {mode === "register" ? "Create Account" : "Sign In with Email"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex rounded-xl border border-white/10 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize ${
                mode === m ? "bg-[#f5b942] text-black" : "text-white/50"
              }`}
              onClick={() => onModeChange(m)}
            >
              {m === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-legacy-crimson">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className={inputCls}
              autoComplete="username"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className={inputCls}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            minLength={8}
            className={inputCls}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
              minLength={8}
              className={inputCls}
              autoComplete="new-password"
            />
          )}
          <PrimaryCTA type="submit" disabled={loading}>
            {loading ? "Entering..." : mode === "register" ? "Create account" : "Log in"}
          </PrimaryCTA>
        </form>

        {process.env.NODE_ENV === "development" && (
          <Button variant="ghost" className="mt-2 w-full text-xs" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
