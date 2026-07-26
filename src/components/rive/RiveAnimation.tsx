"use client";

import { useRive, Layout, Fit, Alignment, type Event } from "@rive-app/react-canvas";

export interface RiveAnimationProps {
  src: string;
  className?: string;
  stateMachines?: string | string[];
  artboard?: string;
  animations?: string | string[];
  autoplay?: boolean;
  fit?: Fit;
  alignment?: Alignment;
  onLoad?: () => void;
  onLoadError?: (error: Event) => void;
}

export function RiveAnimation({
  src,
  className,
  stateMachines,
  artboard,
  animations,
  autoplay = true,
  fit = Fit.Contain,
  alignment = Alignment.Center,
  onLoad,
  onLoadError,
}: RiveAnimationProps) {
  const { RiveComponent } = useRive({
    src,
    artboard,
    animations,
    stateMachines,
    autoplay,
    layout: new Layout({ fit, alignment }),
    onLoad,
    onLoadError,
  });

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <RiveComponent style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
