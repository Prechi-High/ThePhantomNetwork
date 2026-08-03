"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PopupToast } from "@/components/ui/PopupToast";

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

  const steps = [
    { title: "Spin the wheel", body: "Every spin takes ~8 seconds. Tap SPIN — feedback is instant; results arrive from the server." },
    { title: "Reveal your outcome", body: "Advance, Acquire, Discover, Steal, or Void. Tokens roll up — never jump instantly." },
    { title: "Survive the session", body: "Accumulate Session Tokens, help your squad, and build Legacy Influence over time." },
  ];

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <p className="text-xs uppercase tracking-wide text-legacy-muted">First session tutorial · {step + 1}/3</p>
      <Card className="mt-4 p-6">
        <h1 className="text-xl font-bold text-white">{steps[step].title}</h1>
        <p className="mt-3 text-sm text-legacy-muted">{steps[step].body}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={finish}>Skip</Button>
          <Button className="flex-1" onClick={next}>{step >= 2 ? "Begin" : "Next"}</Button>
        </div>
      </Card>
      <PopupToast open={showToken} kind="token" title="+3 Session Tokens" subtitle="Advance outcome" onDismiss={() => setShowToken(false)} />
    </div>
  );
}
