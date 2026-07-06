/**
 * Transform Engine
 * 
 * GPU-accelerated transform utilities for smooth 60 FPS performance.
 * Uses translate3d and will-change for hardware acceleration.
 */

import { normalizedToPixels, type NormalizedRect, type CanvasSize } from '../systems/layout/normalizer';

export interface TransformOptions {
  scale?: number;
  opacity?: number;
  rotation?: number;
}

/**
 * Apply GPU-accelerated transform to an element
 */
export function applyTransform(
  element: HTMLElement,
  normalized: NormalizedRect,
  canvasSize: CanvasSize,
  options: TransformOptions = {}
): void {
  const pixels = normalizedToPixels(normalized, canvasSize);
  const scale = options.scale ?? 1;
  const rotation = options.rotation ?? 0;

  // Use translate3d for GPU acceleration
  const transform = `translate3d(${pixels.x}px, ${pixels.y}px, 0) scale(${scale}) rotate(${rotation}deg)`;

  element.style.transform = transform;
  element.style.width = `${pixels.width}px`;
  element.style.height = `${pixels.height}px`;

  if (options.opacity !== undefined) {
    element.style.opacity = options.opacity.toString();
  }

  // Force GPU layer
  element.style.willChange = 'transform';
}

/**
 * Remove transform and reset element
 */
export function removeTransform(element: HTMLElement): void {
  element.style.transform = '';
  element.style.willChange = 'auto';
}

/**
 * Apply transform during drag (optimized for performance)
 */
export function applyDragTransform(
  element: HTMLElement,
  x: number,
  y: number
): void {
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  element.style.willChange = 'transform';
}

/**
 * Apply transform during resize (optimized for performance)
 */
export function applyResizeTransform(
  element: HTMLElement,
  width: number,
  height: number
): void {
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.willChange = 'width, height';
}

/**
 * Cleanup after drag/resize
 */
export function cleanupTransform(element: HTMLElement): void {
  element.style.willChange = 'auto';
}
