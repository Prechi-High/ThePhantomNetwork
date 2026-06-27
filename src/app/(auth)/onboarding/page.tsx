"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AVATARS } from "@/types/gameplay";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId, referralCode: referralCode || undefined }),
    });

    if (res.ok) {
      router.push("/home");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-6 font-display text-3xl font-bold">Choose Your Identity</h1>

      <Card className="w-full max-w-md space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setAvatarId(avatar.id)}
              className={cn(
                "flex flex-col items-center rounded-lg border p-3 transition-colors",
                avatarId === avatar.id
                  ? "border-phantom-gold bg-phantom-gold/10"
                  : "border-phantom-border hover:border-phantom-muted"
              )}
            >
              <span className="text-2xl">{avatar.emoji}</span>
              <span className="mt-1 text-xs">{avatar.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-phantom-muted">Referral Code (optional)</label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2 text-sm"
            placeholder="Enter camp referral code"
          />
        </div>

        <Button onClick={handleComplete} disabled={loading} className="w-full">
          {loading ? "Entering..." : "Enter THE PHANTOM"}
        </Button>
      </Card>
    </div>
  );
}
