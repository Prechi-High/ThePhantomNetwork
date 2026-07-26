"use client";

import { useCallback } from "react";
import { interactionController } from "../InteractionController";
import type { MotionState, PlayEffectInput } from "../types";

export function useMotionEffect() {
  const playEffect = useCallback((input: PlayEffectInput) => {
    interactionController.playEffect(input);
  }, []);

  const playSound = useCallback((cueId: string, volume?: number) => {
    interactionController.playSound(cueId, volume);
  }, []);

  const transition = useCallback((state: MotionState) => {
    interactionController.transition(state);
  }, []);

  return { playEffect, playSound, transition };
}
