"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getAnimationDef } from "@/lib/motion/AnimationRegistry";
import { motionManager } from "@/lib/motion/MotionManager";
import { experienceStateMachine } from "@/lib/motion/ExperienceStateMachine";
import type { MotionState } from "@/lib/motion/types";

interface MotionLayerProps {
  motionId: string;
  className?: string;
  children?: React.ReactNode;
}

export function MotionLayer({ motionId, className, children }: MotionLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const def = getAnimationDef(motionId);

  useEffect(() => {
    if (!def) return;

    const unregister = motionManager.registerSlot({
      motionId,
      playVariant: () => {
        if (containerRef.current && def.gsapPreset) {
          motionManager.playPreset(def.gsapPreset, containerRef.current, motionId);
        }
      },
    });

    let unobserve: () => void = () => {};
    if (containerRef.current) {
      unobserve = motionManager.observeVisibility(containerRef.current, motionId);
    }

    return () => {
      unregister();
      unobserve();
    };
  }, [motionId, def]);

  useEffect(() => {
    if (!def) return;
    return experienceStateMachine.subscribe((event) => {
      motionManager.fireState(event.to, motionId);
    });
  }, [motionId, def]);

  if (!def) return null;

  const framer = def.framer;

  return (
    <motion.div
      ref={containerRef}
      data-motion-layer={motionId}
      className={className}
      style={{ width: "100%", height: "100%" }}
      initial={framer?.initial}
      animate={framer?.animate}
      transition={framer?.transition}
    >
      {children}
    </motion.div>
  );
}

export function useMotionState(): MotionState | null {
  const [state, setState] = useState<MotionState | null>(experienceStateMachine.getState());
  useEffect(() => {
    return experienceStateMachine.subscribe((e) => setState(e.to));
  }, []);
  return state;
}
