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
      handleTelegramAuth();
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
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }

        let captchaToken: string | undefined;
        if (siteKey) {
          captchaToken = await getCaptchaToken("register");
        }

        const result = await authNetwork.registerEmail({
          email,
          password,
          username: username.trim() || undefined,
          captchaToken,
        });

        if (!result.ok) throw new Error(result.error.message);
        const data = result.data!;
        if (!data.session) throw new Error("Registration succeeded but no session was returned");
        await finishAuth(data.session, data.onboardingComplete);
        return;
      }

      const result = await authNetwork.loginEmail({ email, password });
      if (!result.ok) throw new Error(result.error.message);
      const data = result.data!;
      if (!data.session) throw new Error("Invalid email or password");
      await finishAuth(data.session, data.onboardingComplete);
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
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
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      await finishAuth(data.session, data.onboardingComplete);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dev login failed");
    } finally {
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

      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-legacy-gold">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-legacy-muted">{APP_TAGLINE}</p>
        </div>

        <Card glow className="w-full max-w-sm space-y-4">
          {error && <p className="text-sm text-legacy-crimson">{error}</p>}

          {telegramLoading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-legacy-muted">Initializing Telegram...</p>
            </div>
          ) : loading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-legacy-muted">Entering...</p>
            </div>
          ) : isInTelegram ? (
            <Button onClick={handleTelegramAuth} disabled={loading} className="w-full">
              Enter via Telegram
            </Button>
          ) : (
            <>
              <div className="flex rounded-lg border border-legacy-border p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    mode === "login" ? "bg-legacy-gold text-legacy-bg" : "text-legacy-muted"
                  }`}
                  onClick={() => setMode("login")}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    mode === "register" ? "bg-legacy-gold text-legacy-bg" : "text-legacy-muted"
                  }`}
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === "register" && (
                  <input
                    type="text"
                    placeholder="Username (optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-legacy-border bg-legacy-card px-3 py-2 text-sm text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40"
                    autoComplete="username"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-legacy-border bg-legacy-card px-3 py-2 text-sm text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40"
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-legacy-border bg-legacy-card px-3 py-2 text-sm text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40"
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
                    className="w-full rounded-lg border border-legacy-border bg-legacy-card px-3 py-2 text-sm text-white placeholder:text-legacy-muted focus:outline-none focus:ring-2 focus:ring-legacy-blue/40"
                    autoComplete="new-password"
                  />
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {mode === "register" ? "Create account" : "Log in with email"}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-legacy-border" />
                </div>
                <p className="relative mx-auto w-fit bg-legacy-card px-2 text-xs text-legacy-muted">or</p>
              </div>

              <Button onClick={handleGoogleLogin} variant="secondary" className="w-full">
                Continue with Google
              </Button>

              {isDev && (
                <Button onClick={handleDevLogin} variant="ghost" disabled={loading} className="w-full">
                  Dev Login (local only)
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
