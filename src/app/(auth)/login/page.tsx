"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
      };
    };
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [checkingTelegram, setCheckingTelegram] = useState(true);
  const [error, setError] = useState("");
  const isDev = process.env.NODE_ENV === "development";

  const handleTelegramAuth = useCallback(async () => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) {
      setNeedsCaptcha(true);
      setCheckingTelegram(false);
      return;
    }

    setLoading(true);
    setCheckingTelegram(false);
    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.session) {
        await establishSession(data.session.access_token, data.session.refresh_token);
      }

      router.push(data.onboardingComplete ? "/home" : "/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // Check for 2 seconds (20 * 100ms)
    
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        if (window.Telegram.WebApp.initData) {
          handleTelegramAuth();
          return;
        }
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        // After timeout, show alternative auth methods
        setNeedsCaptcha(true);
        setCheckingTelegram(false);
        return;
      }
      
      // Retry after 100ms
      setTimeout(checkTelegram, 100);
    };
    
    checkTelegram();
  }, [handleTelegramAuth]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (siteKey && window.grecaptcha) {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha!.ready(async () => {
          try {
            const t = await window.grecaptcha!.execute(siteKey, { action: "login" });
            resolve(t);
          } catch (e) {
            reject(e);
          }
        });
      });

      const captchaRes = await fetch("/api/auth/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!captchaRes.ok) {
        setError("Captcha verification failed");
        return;
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) setError(error.message);
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/dev", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await establishSession(data.session.access_token, data.session.refresh_token);
      router.push(data.onboardingComplete ? "/home" : "/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dev login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight">
          THE <span className="text-phantom-gold">PHANTOM</span>
        </h1>
        <p className="mt-2 text-phantom-muted">Enter the darkness. Earn the light.</p>
      </div>

      <Card glow className="w-full max-w-sm space-y-4">
        {error && <p className="text-sm text-phantom-danger">{error}</p>}

        {checkingTelegram ? (
          <div className="text-center">
            <p className="text-sm text-phantom-muted">Connecting to Telegram...</p>
          </div>
        ) : !needsCaptcha ? (
          <Button onClick={handleTelegramAuth} disabled={loading} className="w-full">
            {loading ? "Entering..." : "Enter via Telegram"}
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-phantom-muted">
              Telegram not detected. Sign in with Google or Dev mode.
            </p>
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
  );
}
