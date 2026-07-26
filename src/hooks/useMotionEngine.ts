"use client";

import { useCallback } from "react";
import { interactionController } from "@/lib/motion/InteractionController";
import type { MotionState, PlayEffectInput } from "@/lib/motion/types";
import type { QualityTier } from "@/lib/experience/qualityManager";

export function useMotionEngine() {
  const playEffect = useCallback((input: PlayEffectInput) => {
    interactionController.playEffect(input);
  }, []);

  const playSound = useCallback((cueId: string, volume?: number) => {
    interactionController.playSound(cueId, volume);
  }, []);

  const transition = useCallback((state: MotionState) => {
    interactionController.transition(state);
  }, []);

  const setVolume = useCallback((v: number) => interactionController.setMasterVolume(v), []);
  const setMute = useCallback((m: boolean) => interactionController.setMute(m), []);
  const setQuality = useCallback((t: QualityTier) => interactionController.applyQuality(t), []);

  return { playEffect, playSound, transition, setVolume, setMute, setQuality };
}

export { useMotionState } from "@/components/motion/MotionLayer";
