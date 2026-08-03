"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroFocus, PageShell, PrimaryCTA } from "@/components/design-system";
import { Button } from "@/components/ui/Button";
import { PopupToast } from "@/components/ui/PopupToast";

const STEPS = [
  {
    title: "Spin the wheel",
    body: "Every spin is ~8 seconds. Tap SPIN — feedback is instant; the server delivers the outcome.",
  },
  {
    title: "Reveal your outcome",
    body: "Advance, Acquire, Discover, Steal, or Void. Tokens roll up — never jump instantly.",
  },
  {
    title: "Survive the session",
    body: "Accumulate Session Tokens, help your squad, and build Legacy Influence over time.",
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showToken, setShowToken] = useState(false);

  const finish = () => {
    localStorage.setItem("legacies_tutorial_complete", "1");
    router.push("/home");
  };

  const next = () => {
    if (step === 1) setShowToken(true);
    if (step >= 2) finish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="flex min-h-screen items-center bg-legacy-bg">
      <PageShell withNav={false} className="w-full space-y-6">
        <p className="text-center text-[10px] uppercase tracking-widest text-legacy-muted">
          Tutorial · {step + 1}/3
        </p>
        <HeroFocus title={STEPS[step].title} subtitle={STEPS[step].body} />
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={finish}>
            Skip
          </Button>
          <div className="flex-[2]">
            <PrimaryCTA onClick={next}>{step >= 2 ? "Begin" : "Next"}</PrimaryCTA>
          </div>
        </div>
      </PageShell>
      <PopupToast
        open={showToken}
        kind="token"
        title="+3 Session Tokens"
        subtitle="Advance outcome"
        onDismiss={() => setShowToken(false)}
      />
    </div>
  );
}
