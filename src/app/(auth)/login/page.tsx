"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";
import { useTelegram } from "@/components/providers/TelegramProvider";
import { authNetwork } from "@/lib/network";
import { PrimaryCTA } from "@/components/design-system";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailAuthSheet } from "@/components/auth/EmailAuthSheet";
import { SocialAuthButton } from "@/components/auth/SocialAuthButton";

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
  const [stubMessage, setStubMessage] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
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
    setError("");
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

  const handleStub = () => {
    setStubMessage("Coming soon — this provider is not available yet.");
    setTimeout(() => setStubMessage(""), 3000);
  };

  return (
    <>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="lazyOnload"
        />
      )}

      <AuthShell>
        {telegramLoading || loading ? (
          <p className="py-6 text-center text-sm text-white/60">
            {telegramLoading ? "Initializing Telegram..." : "Entering..."}
          </p>
        ) : isInTelegram ? (
          <PrimaryCTA onClick={handleTelegramAuth}>Enter via Telegram</PrimaryCTA>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                Your Legacy
              </p>
              <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-wide text-transparent bg-gradient-to-b from-[#ffe082] to-[#f5b942] bg-clip-text">
                Begins Now
              </h1>
              <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-white/60">
                Choose how you&apos;ll enter Clashpoint. Your identity is the first step toward
                building influence.
              </p>
            </div>

            {(error || stubMessage) && (
              <p className="text-center text-sm text-legacy-crimson">{error || stubMessage}</p>
            )}

            <div className="space-y-2.5">
              <SocialAuthButton provider="google" onClick={handleGoogleLogin} disabled={loading} />
              <SocialAuthButton provider="apple" onClick={handleStub} disabled={loading} />
              <SocialAuthButton provider="discord" onClick={handleStub} disabled={loading} />
              <SocialAuthButton provider="x" onClick={handleStub} disabled={loading} />
              <SocialAuthButton
                provider="email"
                onClick={() => {
                  setError("");
                  setEmailOpen(true);
                }}
                disabled={loading}
              />
            </div>

            <p className="text-center text-[10px] leading-relaxed text-white/40">
              By continuing, you agree to our{" "}
              <span className="text-[#f5b942]/80">Terms of Service</span> and{" "}
              <span className="text-[#f5b942]/80">Privacy Policy</span>.
            </p>

            {isDev && (
              <button
                type="button"
                onClick={handleDevLogin}
                className="w-full text-center text-xs text-white/30 hover:text-white/60"
              >
                Dev Login
              </button>
            )}
          </div>
        )}
      </AuthShell>

      <EmailAuthSheet
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        mode={mode}
        onModeChange={setMode}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
        username={username}
        onUsernameChange={setUsername}
        error={error}
        loading={loading}
        onSubmit={handleEmailAuth}
      />
    </>
  );
}
