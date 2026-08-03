"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";
import { useTelegram } from "@/components/providers/TelegramProvider";
import { authNetwork } from "@/lib/network";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand/terminology";
import { PrimaryCTA } from "@/components/design-system";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

type AuthMode = "login" | "register";

async function getCaptchaToken(action: string): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || !window.grecaptcha) return undefined;
  return new Promise((resolve, reject) => {
    window.grecaptcha!.ready(async () => {
      try {
        resolve(await window.grecaptcha!.execute(siteKey, { action }));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const inputCls =
  "w-full rounded-xl border border-legacy-divider bg-legacy-surface px-4 py-3 text-sm text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40";

export default function LoginPage() {
  const router = useRouter();
  const { webApp, isLoading: telegramLoading, isInTelegram } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const isDev = process.env.NODE_ENV === "development";
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (telegramLoading) return;
    if (isInTelegram && webApp?.initData) {
      void handleTelegramAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramLoading, isInTelegram, webApp]);

  const finishAuth = async (
    session: { access_token: string; refresh_token: string },
    onboardingComplete?: boolean
  ) => {
    await establishSession(session.access_token, session.refresh_token);
    router.push(onboardingComplete ? "/home" : "/onboarding");
  };

  const handleTelegramAuth = async () => {
    if (!webApp?.initData) return;
    setLoading(true);
    try {
      const result = await authNetwork.loginTelegram(webApp.initData);
      if (!result.ok) throw new Error(result.error.message);
      const data = result.data as {
        session?: { access_token: string; refresh_token: string };
        onboardingComplete?: boolean;
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      if (!data.session) throw new Error("No session returned");
      await finishAuth(data.session, data.onboardingComplete);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        let captchaToken: string | undefined;
        if (siteKey) captchaToken = await getCaptchaToken("register");
        const result = await authNetwork.registerEmail({
          email,
          password,
          username: username.trim() || undefined,
          captchaToken,
        });
        if (!result.ok) throw new Error(result.error.message);
        if (!result.data?.session) throw new Error("No session returned");
        await finishAuth(result.data.session, result.data.onboardingComplete);
        return;
      }
      const result = await authNetwork.loginEmail({ email, password });
      if (!result.ok) throw new Error(result.error.message);
      if (!result.data?.session) throw new Error("Invalid email or password");
      await finishAuth(result.data.session, result.data.onboardingComplete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    if (siteKey && window.grecaptcha) {
      const token = await getCaptchaToken("login");
      if (token) {
        const captchaResult = await authNetwork.verifyCaptcha(token);
        if (!captchaResult.ok) {
          setError("Captcha verification failed");
          return;
        }
      }
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (oauthError) setError(oauthError.message);
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const result = await authNetwork.devLogin();
      if (!result.ok) throw new Error(result.error.message);
      const data = result.data as {
        session: { access_token: string; refresh_token: string };
        onboardingComplete?: boolean;
      };
      await finishAuth(data.session, data.onboardingComplete);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dev login failed");
      setLoading(false);
    }
  };

  return (
    <>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="lazyOnload"
        />
      )}
      <div className="flex min-h-screen flex-col items-center justify-center bg-legacy-bg px-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(245,185,66,0.15) 0%, transparent 45%)",
          }}
        />
        <div className="relative mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-legacy-gold">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-legacy-muted">{APP_TAGLINE}</p>
        </div>

        <Card glow className="relative w-full max-w-sm space-y-4">
          {error && <p className="text-sm text-legacy-crimson">{error}</p>}

          {telegramLoading || loading ? (
            <p className="py-6 text-center text-sm text-legacy-muted">
              {telegramLoading ? "Initializing Telegram..." : "Entering..."}
            </p>
          ) : isInTelegram ? (
            <PrimaryCTA onClick={handleTelegramAuth}>Enter via Telegram</PrimaryCTA>
          ) : (
            <>
              <div className="flex rounded-xl border border-legacy-divider p-1">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize ${
                      mode === m ? "bg-legacy-gold text-legacy-bg" : "text-legacy-muted"
                    }`}
                    onClick={() => setMode(m)}
                  >
                    {m === "login" ? "Log in" : "Register"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === "register" && (
                  <input
                    type="text"
                    placeholder="Username (optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputCls}
                    autoComplete="username"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputCls}
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className={inputCls}
                    autoComplete="new-password"
                  />
                )}
                <PrimaryCTA type="submit">
                  {mode === "register" ? "Create account" : "Log in with email"}
                </PrimaryCTA>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-legacy-divider" />
                </div>
                <p className="relative mx-auto w-fit bg-legacy-card px-2 text-xs text-legacy-muted">
                  or
                </p>
              </div>

              <Button onClick={handleGoogleLogin} variant="secondary" className="w-full">
                Continue with Google
              </Button>
              {isDev && (
                <Button onClick={handleDevLogin} variant="ghost" className="w-full">
                  Dev Login
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
