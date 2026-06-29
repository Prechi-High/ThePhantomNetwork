"use client";

import { useSpritesheetAnimation } from "@/lib/sprites/useSpritesheetAnimation";
import type { SpriteConfig } from "@/lib/assets/types";
import { useMemo } from "react";

export interface AnimatedSpriteProps {
  config?: SpriteConfig;
  paused?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedSprite({
  config,
  paused,
  width,
  height,
  className,
  style,
}: AnimatedSpriteProps) {
  const { image, currentFrameData, loading, metadata } = useSpritesheetAnimation({
    config,
    paused,
  });

  const { backgroundPosition, backgroundSize } = useMemo(() => {
    if (!currentFrameData || !metadata) {
      return { backgroundPosition: "0 0", backgroundSize: "100% 100%" };
    }

    const { frame, sourceSize } = currentFrameData;
    const { size } = metadata.meta;

    return {
      backgroundPosition: `-${frame.x}px -${frame.y}px`,
      backgroundSize: `${size.w}px ${size.h}px`,
    };
  }, [currentFrameData, metadata]);

  const containerSize = useMemo(() => {
    if (!currentFrameData) {
      return { width: width || 256, height: height || 256 };
    }
    const { sourceSize } = currentFrameData;
    return {
      width: width || sourceSize.w,
      height: height || sourceSize.h,
    };
  }, [currentFrameData, width, height]);

  if (loading || !image || !currentFrameData) {
    return (
      <div
        className={className}
        style={{
          ...style,
          width: containerSize.width,
          height: containerSize.height,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        ...containerSize,
        backgroundImage: `url(${image.src})`,
        backgroundPosition,
        backgroundSize,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}
