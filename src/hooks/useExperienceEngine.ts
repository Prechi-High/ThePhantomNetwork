"use client";

/**
 * useExperienceEngine — React Bridge for the Experience Engine
 *
 * Mounts the Experience Engine to DOM elements and exposes
 * controls to React components.
 *
 * Usage in page.tsx:
 *   const { rootRef, fxRef, lightingRef, trigger, setVolume } = useExperienceEngine();
 *
 *   return (
 *     <div ref={rootRef}>
 *       <div ref={fxRef} />        {/* screen FX overlay *}
 *       <div ref={lightingRef} />  {/* lighting overlay *}
 *       <GameplayHUD />
 *     </div>
 *   );
 *
 * The engine is initialized once on mount and destroyed on unmount.
 * All gameplay events are wired automatically via gameplayEvents.
 */

import { useCallback, useEffect, useRef } from "react";
import { experienceEngine }  from "@/lib/experience/ExperienceEngine";
import { qualityManager }    from "@/lib/experience/qualityManager";
import { audioLayerController } from "@/lib/experience/audioLayer";
import type { QualityTier }  from "@/lib/experience/qualityManager";

interface UseExperienceEngineReturn {
  /** Attach to the outermost gameplay container for camera effects */
  rootRef: React.RefObject<HTMLDivElement | null>;
  /** Attach to an absolutely-positioned overlay for screen FX */
  fxRef: React.RefObject<HTMLDivElement | null>;
  /** Attach to an absolutely-positioned overlay for lighting */
  lightingRef: React.RefObject<HTMLDivElement | null>;
  /** Manually trigger an experience */
  trigger: (experienceId: string, context?: Record<string, unknown>) => void;
  /** Master volume 0–1 */
  setVolume: (v: number) => void;
  /** Mute/unmute all audio + haptics */
  setMute: (mute: boolean) => void;
  /** Override quality tier */
  setQuality: (tier: QualityTier) => void;
  /** Debug snapshot */
  getDebugInfo: () => ReturnType<typeof experienceEngine.getDebugInfo>;
}

export function useExperienceEngine(): UseExperienceEngineReturn {
  const rootRef     = useRef<HTMLDivElement>(null);
  const fxRef       = useRef<HTMLDivElement>(null);
  const lightingRef = useRef<HTMLDivElement>(null);

  // Initialize on mount, destroy on unmount
  useEffect(() => {
    const root     = rootRef.current;
    const fx       = fxRef.current;
    const lighting = lightingRef.current;

    if (!root || !fx || !lighting) return;

    experienceEngine.initialize(root, fx, lighting);

    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      audioLayerController.initialize();
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });

    return () => {
      experienceEngine.destroy();
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
  }, []);

  const trigger = useCallback(
    (experienceId: string, context?: Record<string, unknown>) => {
      experienceEngine.trigger(experienceId, context);
    },
    []
  );

  const setVolume  = useCallback((v: number) => experienceEngine.setMasterVolume(v), []);
  const setMute    = useCallback((m: boolean) => experienceEngine.setMute(m), []);
  const setQuality = useCallback((t: QualityTier) => experienceEngine.setQuality(t), []);
  const getDebugInfo = useCallback(() => experienceEngine.getDebugInfo(), []);

  return { rootRef, fxRef, lightingRef, trigger, setVolume, setMute, setQuality, getDebugInfo };
}
