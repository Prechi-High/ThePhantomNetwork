"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  OnboardingBackButton,
  OnboardingProgressBar,
  OnboardingSkipButton,
  OnboardingStarLogo,
} from "./shared";

interface OnboardingShellProps {
  activeStep: number;
  bgSrc: string;
  onSkip: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
  onStepSelect?: (step: number) => void;
  children: React.ReactNode;
}

export function OnboardingShell({
  activeStep,
  bgSrc,
  onSkip,
  onSwipeNext,
  onSwipePrev,
  onStepSelect,
  children,
}: OnboardingShellProps) {
  const dragStartX = useRef<number | null>(null);

  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };

  const handleDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - clientX;
    if (delta > 50) onSwipeNext?.();
    else if (delta < -50) onSwipePrev?.();
    dragStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-black"
      onTouchStart={(e) => handleDragStart(e.touches[0]?.clientX ?? 0)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0]?.clientX ?? 0)}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") handleDragStart(e.clientX);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") handleDragEnd(e.clientX);
      }}
    >
      <Image
        src={bgSrc}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90" />

      <div className="relative flex h-dvh w-full max-w-[430px] flex-col">
        <div className="flex items-start justify-between px-4 pt-4">
          {activeStep > 0 && onSwipePrev ? (
            <OnboardingBackButton onBack={onSwipePrev} />
          ) : (
            <div className="w-16" />
          )}
          <div className="flex flex-col items-center gap-2 pt-1">
            <OnboardingProgressBar activeStep={activeStep} onStepSelect={onStepSelect} />
            <OnboardingStarLogo />
          </div>
          <OnboardingSkipButton onSkip={onSkip} />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
