"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronRight, Globe, Languages, RefreshCw, Sparkles, User } from "lucide-react";
import { AVATARS } from "@/types/gameplay";
import { authNetwork } from "@/lib/network";
import { PrimaryCTA } from "@/components/design-system";
import {
  AvatarCarousel,
  generateUsernameSuggestions,
  IdentityValueProps,
  OnboardingIdentityPreviewCard,
} from "./OnboardingIdentityPreviewCard";
import { OnboardingBackButton, OnboardingStarLogo } from "./shared";
import { useWorldStats } from "@/components/auth/LiveWorldStats";

interface OnboardingAvatarStepProps {
  username: string;
  avatarId: string;
  referralCode: string;
  onUsernameChange: (username: string) => void;
  onAvatarChange: (avatarId: string) => void;
  onReferralChange: (code: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingAvatarStep({
  username,
  avatarId,
  referralCode,
  onUsernameChange,
  onAvatarChange,
  onReferralChange,
  onBack,
  onNext,
}: OnboardingAvatarStepProps) {
  const stats = useWorldStats();
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    generateUsernameSuggestions(username)
  );
  const [region] = useState("Nigeria");
  const [language] = useState("English");

  const checkUsername = useCallback(async (name: string) => {
    if (name.length < 3) {
      setAvailable(null);
      setCheckError("");
      return;
    }
    setChecking(true);
    const result = await authNetwork.checkUsername(name);
    setChecking(false);
    if (result.ok) {
      setAvailable(result.data.available);
      setCheckError(result.data.error ?? "");
    } else {
      setAvailable(false);
      setCheckError(result.error.message ?? "Could not check username");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  const refreshSuggestions = () => {
    setSuggestions(generateUsernameSuggestions(username));
  };

  const canContinue = username.length >= 3 && available === true;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-black">
      <Image
        src="/assets/onboarding/identity-bg.png"
        alt=""
        fill
        className="object-cover object-center opacity-40"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/95" />

      <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col px-4 pb-8 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <OnboardingBackButton onBack={onBack} />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400">
              {stats.playersOnline.toLocaleString()} PLAYERS ONLINE
            </span>
          </div>
        </div>

        <OnboardingStarLogo />
        <h1 className="mt-2 text-center font-display text-xl font-bold uppercase tracking-wide text-[#f5b942]">
          Forge Your Identity
        </h1>
        <p className="mb-4 text-center text-xs text-white/50">How will history remember you?</p>

        <IdentityValueProps />

        <div className="my-4">
          <OnboardingIdentityPreviewCard username={username} avatarId={avatarId} />
        </div>

        <div className="space-y-4 overflow-y-auto">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f5b942]">
              Choose Your Username
            </p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value.replace(/\s/g, ""))}
                className="w-full rounded-xl border border-[#f5b942]/35 bg-black/70 py-3 pl-10 pr-24 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f5b942]/25"
                placeholder="ShadowRaven"
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {checking ? (
                  <span className="text-[10px] text-white/40">...</span>
                ) : available === true ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Available</span>
                  </>
                ) : available === false ? (
                  <span className="text-[10px] text-legacy-crimson">Taken</span>
                ) : null}
              </div>
            </div>
            {checkError && <p className="mt-1 text-[10px] text-legacy-crimson">{checkError}</p>}
            <p className="mt-1 text-[9px] text-white/35">
              This name will appear in sessions, leaderboards, rivalries, and your legacy across
              Clashpoint.
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#f5b942]">
                Suggestions
              </p>
              <button type="button" onClick={refreshSuggestions} aria-label="Refresh suggestions">
                <RefreshCw className="h-3.5 w-3.5 text-[#f5b942]/70" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUsernameChange(s)}
                  className="rounded-full border border-[#f5b942]/30 px-3 py-1 text-[11px] text-white/80 hover:border-[#f5b942]/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#f5b942]">
                Choose Your Avatar
              </p>
              <span className="text-[9px] text-white/40">Tap to select</span>
            </div>
            <AvatarCarousel avatarId={avatarId} onSelect={onAvatarChange} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#f5b942]/25 bg-black/60 px-3 py-2.5">
              <Globe className="h-4 w-4 text-[#f5b942]/70" />
              <span className="flex-1 text-xs text-white/80">{region}</span>
              <ChevronRight className="h-3 w-3 rotate-90 text-white/30" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#f5b942]/25 bg-black/60 px-3 py-2.5">
              <Languages className="h-4 w-4 text-[#f5b942]/70" />
              <span className="flex-1 text-xs text-white/80">{language}</span>
              <ChevronRight className="h-3 w-3 rotate-90 text-white/30" />
            </div>
          </div>

          <input
            type="text"
            value={referralCode}
            onChange={(e) => onReferralChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/30"
            placeholder="Camp referral code (optional)"
          />
        </div>

        <div className="mt-4 space-y-2">
          <PrimaryCTA onClick={onNext} disabled={!canContinue}>
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Forge My Identity
              <ChevronRight className="h-4 w-4" />
            </span>
          </PrimaryCTA>
          <p className="text-center text-[9px] text-white/35">
            Your identity is yours alone. Choose wisely.
          </p>
        </div>
      </div>
    </div>
  );
}
