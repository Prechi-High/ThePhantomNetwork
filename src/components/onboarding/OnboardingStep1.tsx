"use client";

import { useEffect, useState } from "react";
import { Swords, Users } from "lucide-react";
import { worldNetwork } from "@/lib/network";
import { OnboardingShell } from "./OnboardingShell";
import {
  GoldHighlight,
  OnboardingBody,
  OnboardingHeadline,
  SwipeContinueButton,
} from "./shared";

interface OnboardingStep1Props {
  onNext: () => void;
  onSkip: () => void;
  onStepSelect: (step: number) => void;
}

export function OnboardingStep1({ onNext, onSkip, onStepSelect }: OnboardingStep1Props) {
  const [playersOnline, setPlayersOnline] = useState(31482);
  const [sessionsStarting, setSessionsStarting] = useState(143);

  useEffect(() => {
    worldNetwork.getSummary().then((res) => {
      if (!res.ok || !res.data?.stats) return;
      const s = res.data.stats;
      if (s.playersOnline > 0) setPlayersOnline(s.playersOnline);
      if (s.activeSessions > 0) setSessionsStarting(s.activeSessions);
    });
  }, []);

  return (
    <OnboardingShell
      activeStep={0}
      bgSrc="/assets/onboarding/step-1-bg.png"
      onSkip={onSkip}
      onSwipeNext={onNext}
      onStepSelect={onStepSelect}
    >
      <div className="flex flex-1 flex-col">
        <div className="space-y-3 pt-2">
          <OnboardingHeadline line1="The World" line2="Never Waits." />
          <OnboardingBody>
            Thousands of players are already building alliances, challenging rivals, and
            shaping the future of Clashpoint. Every decision{" "}
            <GoldHighlight>changes the balance of power.</GoldHighlight>
          </OnboardingBody>
        </div>

        <div className="flex-1" />

        <div className="space-y-4">
          <div className="rounded-lg border border-[#f5b942]/35 bg-black/75 p-3 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#f5b942]">
                ((•)) Live World Feed
              </p>
              <span className="flex items-center gap-1 text-[8px] font-semibold uppercase text-[#39D98A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39D98A]" />
                Live
              </span>
            </div>
            <ul className="space-y-1.5 text-[9px] text-white/60">
              <li className="flex justify-between gap-2">
                <span>Solara captured East Bastion</span>
                <span className="shrink-0 text-white/40">38s ago</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Nocturis declared a rivalry</span>
                <span className="shrink-0 text-white/40">1m ago</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Swords className="h-3 w-3 text-[#f5b942]" />
                  {sessionsStarting} Sessions starting
                </span>
                <span className="text-[#39D98A]">Live</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-white/50" />
                  {playersOnline.toLocaleString()} Players online
                </span>
                <span className="text-[#39D98A]">Live</span>
              </li>
            </ul>
          </div>

          <SwipeContinueButton onNext={onNext} />
        </div>
      </div>
    </OnboardingShell>
  );
}
