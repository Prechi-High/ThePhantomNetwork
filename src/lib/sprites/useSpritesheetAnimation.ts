import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AssetRegistry } from "../assets/AssetRegistry";
import type { SpriteConfig, SpritesheetMetadata, SpriteFrame } from "../assets/types";

export interface UseSpritesheetAnimationParams {
  config?: SpriteConfig;
  paused?: boolean;
}

export function useSpritesheetAnimation({
  config,
  paused = false,
}: UseSpritesheetAnimationParams) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<SpriteFrame[]>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [metadata, setMetadata] = useState<SpritesheetMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const frameIndexRef = useRef(0);
  const lastTimestampRef = useRef<number>(0);
  const animationIdRef = useRef<number>();
  const configRef = useRef(config);

  // Memoize frame order from config or metadata
  const frameOrder = useMemo(() => {
    if (!metadata) return [];
    if (config?.frameOrder) {
      return config.frameOrder.filter((key) => metadata.frames[key]);
    }
    // Sort frame keys by name to ensure consistent order
    return Object.keys(metadata.frames).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(b.replace(/\D/g, "") || "0", 10);
      return numA - numB;
    });
  }, [metadata, config?.frameOrder]);

  // Memoize fps
  const fps = config?.fps ?? 24;
  const frameDuration = 1000 / fps;

  // Load metadata and image
  useEffect(() => {
    configRef.current = config;
    if (!config) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all([
      AssetRegistry.getSpritesheetMetadata(config.metadataPath),
      config.spritePath ? AssetRegistry.loadImage(config.spritePath) : Promise.resolve(null),
    ]).then(([md, img]) => {
      if (!mounted) return;
      setMetadata(md);
      setImage(img);
      setFrames(frameOrder.map((key) => md.frames[key]));
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [config?.metadataPath, config?.spritePath, frameOrder]);

  // Reset frame index when config changes
  useEffect(() => {
    frameIndexRef.current = 0;
    setCurrentFrame(0);
  }, [config?.metadataPath]);

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      if (!configRef.current || paused || !metadata || frames.length === 0) {
        return;
      }

      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimestampRef.current;
      if (elapsed >= frameDuration) {
        const numFramesToAdvance = Math.floor(elapsed / frameDuration);
        frameIndexRef.current = (frameIndexRef.current + numFramesToAdvance) % frames.length;
        setCurrentFrame(frameIndexRef.current);
        lastTimestampRef.current = timestamp;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    },
    [frameDuration, frames.length, metadata, paused]
  );

  useEffect(() => {
    if (!paused && metadata && frames.length > 0) {
      animationIdRef.current = requestAnimationFrame(animate);
    } else {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      lastTimestampRef.current = 0;
    }

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [animate, metadata, frames.length, paused]);

  // Current frame
  const currentFrameData = frames[currentFrame];

  return {
    currentFrameData,
    frames,
    image,
    metadata,
    loading,
    paused,
  };
}
