"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AVATARS } from "@/types/gameplay";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";
import { authNetwork } from "@/lib/network";
import { HeroFocus, PageShell, PrimaryCTA } from "@/components/design-system";

export default function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        establishSession(session.access_token, session.refresh_token).catch(() => {});
      }
    });
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await authNetwork.completeOnboarding({
        avatarId,
        referralCode: referralCode || undefined,
      });
      if (result.ok) {
        router.push("/welcome");
        router.refresh();
        return;
      }
      if (result.error.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      setError(result.error.message ?? "Could not complete onboarding.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-legacy-bg">
      <PageShell withNav={false} className="w-full space-y-6">
        <HeroFocus
          eyebrow="Identity"
          title="Choose Your Avatar"
          subtitle="Your camp is assigned automatically. Optional referral joins you to a community."
        />
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setAvatarId(avatar.id)}
              className={cn(
                "flex flex-col items-center rounded-xl border p-3 transition-colors",
                avatarId === avatar.id
                  ? "border-legacy-gold bg-legacy-gold/10"
                  : "border-legacy-divider bg-legacy-card hover:border-legacy-muted"
              )}
            >
              <span className="text-2xl">{avatar.emoji}</span>
              <span className="mt-1 text-[10px] text-legacy-muted">{avatar.label}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full rounded-xl border border-legacy-divider bg-legacy-surface px-4 py-3 text-sm text-white placeholder:text-legacy-muted"
          placeholder="Camp referral code (optional)"
        />
        {error && <p className="text-sm text-legacy-crimson">{error}</p>}
        <PrimaryCTA onClick={handleComplete} disabled={loading}>
          {loading ? "Entering..." : "Continue"}
        </PrimaryCTA>
      </PageShell>
    </div>
  );
}
