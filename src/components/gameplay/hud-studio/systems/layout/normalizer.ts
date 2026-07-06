/**
 * Normalized Position System
 * 
 * Utilities for converting between pixel positions and normalized (0.0-1.0) positions.
 * This ensures layouts are responsive across all device sizes.
 */

export interface CanvasSize {
  width: number;
  height: number;
}

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedRect {
  x: number; // 0.0 - 1.0
  y: number; // 0.0 - 1.0
  width: number; // 0.0 - 1.0
  height: number; // 0.0 - 1.0
}

/**
 * Convert pixel positions to normalized (0.0-1.0) positions
 */
export function pixelsToNormalized(
  pixels: PixelRect,
  canvas: CanvasSize
): NormalizedRect {
  return {
    x: roundNormalized(pixels.x / canvas.width),
    y: roundNormalized(pixels.y / canvas.height),
    width: roundNormalized(pixels.width / canvas.width),
    height: roundNormalized(pixels.height / canvas.height),
  };
}

/**
 * Convert normalized (0.0-1.0) positions to pixel positions
 */
export function normalizedToPixels(
  normalized: NormalizedRect,
  canvas: CanvasSize
): PixelRect {
  return {
    x: Math.round(normalized.x * canvas.width),
    y: Math.round(normalized.y * canvas.height),
    width: Math.round(normalized.width * canvas.width),
    height: Math.round(normalized.height * canvas.height),
  };
}

/**
 * Clamp a normalized value to 0.0-1.0 range
 */
export function clampNormalized(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Round a normalized value to specified precision
 */
export function roundNormalized(value: number, precision = 4): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Check if normalized rect is within canvas bounds
 */
export function isWithinBounds(rect: NormalizedRect): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= 1 &&
    rect.y + rect.height <= 1
  );
}

/**
 * Constrain normalized rect to canvas bounds
 */
export function constrainToBounds(rect: NormalizedRect): NormalizedRect {
  const maxX = clampNormalized(1 - rect.width);
  const maxY = clampNormalized(1 - rect.height);

  return {
    x: clampNormalized(Math.min(rect.x, maxX)),
    y: clampNormalized(Math.min(rect.y, maxY)),
    width: clampNormalized(rect.width),
    height: clampNormalized(rect.height),
  };
}
