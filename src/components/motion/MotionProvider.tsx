"use client";

import { useEffect, useRef } from "react";
import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { interactionController } from "@/lib/motion/InteractionController";
import { qualityManager } from "@/lib/experience/qualityManager";

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const fxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    qualityManager.detect();
    interactionController.initialize();

    if (fxRef.current) {
      interactionController.mountVisualFx(fxRef.current);
    }

    const unsubQuality = qualityManager.onChange((profile) => {
      interactionController.applyQuality(profile.tier);
    });
    interactionController.applyQuality(qualityManager.getTier());

    const handleFirstInteraction = () => {
      interactionController.initialize();
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });

    return () => {
      unsubQuality();
      interactionController.unmountVisualFx();
      interactionController.destroy();
    };
  }, []);

  return (
    <ParticlesProvider init={loadSlim}>
      <div ref={fxRef} className="pointer-events-none fixed inset-0 z-[9990]" aria-hidden />
      {children}
    </ParticlesProvider>
  );
}
