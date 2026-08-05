"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingProgressBar({
  activeStep,
  onStepSelect,
}: {
  activeStep: number;
  onStepSelect?: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to step ${i + 1}`}
          onClick={() => onStepSelect?.(i)}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i === activeStep ? "w-8 bg-[#f5b942]" : "w-6 bg-white/20",
            i < activeStep && "bg-[#f5b942]/50",
            onStepSelect && "cursor-pointer hover:opacity-90"
          )}
        />
      ))}
    </div>
  );
}

export function OnboardingStarLogo() {
  return (
    <div className="mx-auto flex h-6 w-6 items-center justify-center text-[#f5b942]">
      <Sparkles className="h-4 w-4" strokeWidth={2.5} />
    </div>
  );
}

export function OnboardingBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm"
    >
      ‹ Back
    </button>
  );
}

export function OnboardingSkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="rounded-full border border-[#f5b942]/40 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm"
    >
      Skip ›
    </button>
  );
}

export function OnboardingHeadline({
  line1,
  line2,
  className,
}: {
  line1: string;
  line2: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <h1 className="font-display text-[22px] font-bold uppercase leading-tight tracking-wide text-white">
        {line1}
      </h1>
      <h1 className="font-display text-[22px] font-bold uppercase leading-tight tracking-wide text-[#f5b942]">
        {line2}
      </h1>
    </div>
  );
}

export function OnboardingEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
      {children}
    </p>
  );
}

export function OnboardingBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-[11px] leading-relaxed text-white/65">{children}</p>
  );
}

export function OnboardingStatPill({
  icon: Icon,
  value,
  label,
  accent,
  barColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent: string;
  barColor: string;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center overflow-hidden rounded-lg border border-white/[0.08] bg-black/75 py-2 backdrop-blur-sm">
      <Icon className={cn("mb-0.5 h-4 w-4 shrink-0", accent)} />
      <p className="text-base font-bold leading-none tabular-nums text-white">{value}</p>
      <p className={cn("mt-1 px-0.5 text-center text-[6px] font-bold uppercase leading-tight", accent)}>
        {label}
      </p>
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", barColor)} />
    </div>
  );
}

export function SwipeContinueButton({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onNext}
        aria-label="Continue"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#f5b942]/50 bg-black/60 shadow-[0_0_20px_rgba(245,185,66,0.25)] backdrop-blur-sm"
      >
        <ArrowRight className="h-6 w-6 text-[#f5b942]" />
      </button>
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f5b942]/80">
        Swipe to continue
      </p>
    </div>
  );
}

export function GoldHighlight({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-[#f5b942]">{children}</span>;
}
