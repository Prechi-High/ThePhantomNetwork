"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { establishSession } from "@/lib/auth/establish-session";
import { AVATARS } from "@/types/gameplay";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { OnboardingAvatarStep } from "./OnboardingAvatarStep";
import { OnboardingChooseCampStep } from "./OnboardingChooseCampStep";

export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [username, setUsername] = useState("ShadowRaven");
  const [avatarId, setAvatarId] = useState<string>(AVATARS[4].id);

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

  const goToIdentity = () => setStep(3);
  const goToCamp = () => setStep(4);
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const goToIntroStep = (introStep: number) => setStep(Math.min(Math.max(introStep, 0), 2));

  if (step === 0) {
    return (
      <OnboardingStep1
        onNext={next}
        onSkip={goToIdentity}
        onStepSelect={goToIntroStep}
      />
    );
  }
  if (step === 1) {
    return (
      <OnboardingStep2
        onNext={next}
        onPrev={prev}
        onSkip={goToIdentity}
        onStepSelect={goToIntroStep}
      />
    );
  }
  if (step === 2) {
    return (
      <OnboardingStep3
        onNext={goToIdentity}
        onPrev={prev}
        onSkip={goToIdentity}
        onStepSelect={goToIntroStep}
      />
    );
  }
  if (step === 3) {
    return (
      <OnboardingAvatarStep
        username={username}
        avatarId={avatarId}
        referralCode={referralCode}
        onUsernameChange={setUsername}
        onAvatarChange={setAvatarId}
        onReferralChange={setReferralCode}
        onBack={() => setStep(2)}
        onNext={goToCamp}
      />
    );
  }

  return (
    <OnboardingChooseCampStep
      username={username}
      avatarId={avatarId}
      referralCode={referralCode}
      onBack={() => setStep(3)}
    />
  );
}
