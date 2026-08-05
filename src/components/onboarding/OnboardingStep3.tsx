"use client";

import { ArrowRight, Crown, Flag, Swords, Trophy } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import {
  GoldHighlight,
  OnboardingBody,
  OnboardingEyebrow,
  OnboardingHeadline,
} from "./shared";

interface OnboardingStep3Props {
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onStepSelect: (step: number) => void;
}

export function OnboardingStep3({ onNext, onPrev, onSkip, onStepSelect }: OnboardingStep3Props) {
  return (
    <OnboardingShell
      activeStep={2}
      bgSrc="/assets/onboarding/step-3-bg.png"
      onSkip={onSkip}
      onSwipePrev={onPrev}
      onStepSelect={onStepSelect}
    >
      <div className="flex flex-1 flex-col">
        <div className="space-y-3 pt-2">
          <OnboardingEyebrow>Legacy is remembered</OnboardingEyebrow>
          <OnboardingHeadline line1="Your Name" line2="Can Change the World." />
          <OnboardingBody>
            Every session, rivalry, and victory becomes part of the permanent record. Rise
            through the ranks and become one of the <GoldHighlight>legends of Clashpoint.</GoldHighlight>
          </OnboardingBody>
        </div>

        <div className="flex-1" />

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#f5b942]/30 bg-black/75 py-2 backdrop-blur-md">
            {[
              { icon: Crown, label: "New Leaders", value: "9", accent: "text-[#f5b942]" },
              { icon: Swords, label: "Rivalries Settled", value: "18", accent: "text-[#f5b942]" },
              { icon: Trophy, label: "Sessions Done", value: "2,431", accent: "text-[#f5b942]" },
              { icon: Flag, label: "Season 18", value: "Live", accent: "text-[#A78BFA]" },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="flex flex-col items-center px-0.5 text-center">
                <Icon className={`mb-0.5 h-3.5 w-3.5 ${accent}`} />
                <p className="text-[11px] font-bold tabular-nums text-white">{value}</p>
                <p className="text-[5.5px] font-bold uppercase leading-tight text-white/45">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex w-full items-center justify-between rounded-full bg-gradient-to-r from-[#f5b942] to-[#c4922a] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(245,185,66,0.35)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white">
              CP
            </span>
            <span>Begin Your Journey</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20">
              <ArrowRight className="h-4 w-4 text-white" />
            </span>
          </button>

          <p className="text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f5b942]/70">
            Your legacy starts now.
          </p>
        </div>
      </div>
    </OnboardingShell>
  );
}
