"use client";

import { Flag, Flame, Swords, Users } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import {
  GoldHighlight,
  OnboardingBody,
  OnboardingEyebrow,
  OnboardingHeadline,
  OnboardingStatPill,
  SwipeContinueButton,
} from "./shared";

interface OnboardingStep2Props {
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onStepSelect: (step: number) => void;
}

export function OnboardingStep2({ onNext, onPrev, onSkip, onStepSelect }: OnboardingStep2Props) {
  return (
    <OnboardingShell
      activeStep={1}
      bgSrc="/assets/onboarding/step-2-bg.png"
      onSkip={onSkip}
      onSwipeNext={onNext}
      onSwipePrev={onPrev}
      onStepSelect={onStepSelect}
    >
      <div className="flex flex-1 flex-col">
        <div className="space-y-3 pt-2">
          <OnboardingEyebrow>Nothing is won alone</OnboardingEyebrow>
          <OnboardingHeadline line1="Every Rivalry" line2="Begins With a Camp." />
          <OnboardingBody>
            Choose where you belong. Build squads, defend territory, challenge enemies, and
            fight for your camp&apos;s <GoldHighlight>influence across the world.</GoldHighlight>
          </OnboardingBody>
        </div>

        <div className="flex-1" />

        <div className="space-y-4">
          <div className="flex gap-1.5">
            <OnboardingStatPill
              icon={Flag}
              value={56}
              label="Camps Competing"
              accent="text-[#f5b942]"
              barColor="bg-[#f5b942]"
            />
            <OnboardingStatPill
              icon={Users}
              value={824}
              label="Active Squads"
              accent="text-[#4C8DFF]"
              barColor="bg-[#4C8DFF]"
            />
            <OnboardingStatPill
              icon={Swords}
              value={17}
              label="Camp Wars"
              accent="text-[#f5b942]"
              barColor="bg-[#f5b942]"
            />
            <OnboardingStatPill
              icon={Flame}
              value={420}
              label="Rivalries Active"
              accent="text-[#A78BFA]"
              barColor="bg-[#A78BFA]"
            />
          </div>

          <SwipeContinueButton onNext={onNext} />
        </div>
      </div>
    </OnboardingShell>
  );
}
