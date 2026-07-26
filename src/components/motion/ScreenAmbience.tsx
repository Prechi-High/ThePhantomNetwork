"use client";

import { useMemo } from "react";
import Particles from "@tsparticles/react";
import { SCREEN_AMBIENCE } from "@/lib/motion/ParticleRegistry";
import { interactionController } from "@/lib/motion/InteractionController";
import type { ScreenId } from "@/lib/motion/types";
import { useEffect } from "react";

interface ScreenAmbienceProps {
  screen: ScreenId;
  className?: string;
}

const AMBIENCE_OPTIONS: Record<string, object> = {
  fog: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 30 },
      color: { value: "#6b21a8" },
      opacity: { value: { min: 0.05, max: 0.15 } },
      size: { value: { min: 40, max: 120 } },
      move: { enable: true, speed: 0.3, direction: "right" as const },
    },
  },
  embers: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 20 },
      color: { value: ["#f59e0b", "#ef4444"] },
      opacity: { value: { min: 0.2, max: 0.6 } },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.8, direction: "top" as const },
    },
  },
  magic_sparks: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 15 },
      color: { value: "#c084fc" },
      opacity: { value: { min: 0.1, max: 0.4 } },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: 0.5 },
    },
  },
  dust: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 25 },
      color: { value: "#a78bfa" },
      opacity: { value: 0.15 },
      size: { value: 1 },
      move: { enable: true, speed: 0.2 },
    },
  },
  energy_pulse: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 8 },
      color: { value: "#8b5cf6" },
      opacity: { value: 0.2 },
      size: { value: { min: 2, max: 6 } },
      move: { enable: true, speed: 0.4 },
    },
  },
  golden_shards: {
    fullScreen: { enable: true },
    particles: {
      number: { value: 12 },
      color: { value: "#f59e0b" },
      opacity: { value: 0.25 },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.6 },
    },
  },
};

export function ScreenAmbience({ screen, className }: ScreenAmbienceProps) {
  const presets = SCREEN_AMBIENCE[screen] ?? [];
  const primaryPreset = presets.find((p) => AMBIENCE_OPTIONS[p]) ?? "fog";
  const options = useMemo(() => AMBIENCE_OPTIONS[primaryPreset] ?? AMBIENCE_OPTIONS.fog, [primaryPreset]);

  useEffect(() => {
    interactionController.setScreen(screen);
  }, [screen]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 ${className ?? ""}`} aria-hidden>
      <Particles id={`ambience-${screen}`} options={options} />
    </div>
  );
}
