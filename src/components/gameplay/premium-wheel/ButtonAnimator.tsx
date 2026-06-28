"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import spriteSheetData from "../../../../ass/spritesheet (3).json";

type ButtonState = "idle" | "hover" | "pressed" | "cooldown" | "success";

interface ButtonAnimatorProps {
  state: ButtonState;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SPRITE_SHEET_URL = "/spritesheet.png";
const STATE_TO_FRAME: Record<ButtonState, string[]> = {
  idle: ["tile000.png"],
  hover: ["tile001.png", "tile002.png"],
  pressed: ["tile004.png", "tile005.png"],
  cooldown: ["tile006.png", "tile008.png", "tile009.png", "tile010.png"],
  success: ["tile012.png", "tile013.png", "tile014.png"],
};

export function ButtonAnimator({
  state,
  disabled,
  onClick,
  className,
}: ButtonAnimatorProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const frameDurationRef = useRef(150);

  const getFrameData = (key: string): SpriteFrame | null => {
    const frame = spriteSheetData.frames[key as keyof typeof spriteSheetData.frames];
    if (!frame) return null;
    return {
      x: frame.frame.x,
      y: frame.frame.y,
      w: frame.frame.w,
      h: frame.frame.h,
    };
  };

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    const delta = time - previousTimeRef.current;

    if (delta >= frameDurationRef.current) {
      setFrameIndex((prev) => {
        const frames = STATE_TO_FRAME[state];
        return (prev + 1) % frames.length;
      });
      previousTimeRef.current = time;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [state]);

  useEffect(() => {
    setFrameIndex(0);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const frames = STATE_TO_FRAME[state];
  const currentFrameKey = frames[frameIndex];
  const frameData = getFrameData(currentFrameKey);

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-lg border-none bg-transparent p-0 ${className}`}
      style={{ width: frameData ? frameData.w : 227, height: frameData ? frameData.h : 114 }}
    >
      {frameData && (
        <div
          className="absolute inset-0"
          style={{
          backgroundImage: `url(${SPRITE_SHEET_URL})`,
          backgroundPosition: `-${frameData.x}px -${frameData.y}px`,
          backgroundSize: `${spriteSheetData.meta.size.w}px ${spriteSheetData.meta.size.h}px`,
        }}
      />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-xl font-bold uppercase tracking-widest text-white drop-shadow-lg">
          ENGAGE
        </span>
      </div>
    </motion.button>
  );
}
