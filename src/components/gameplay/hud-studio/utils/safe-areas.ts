/**
 * Safe Area Utilities
 * 
 * Calculates safe areas for different devices.
 */

/**
 * Device safe area configuration
 */
export interface DeviceSafeAreas {
  top: number; // Normalized (0-1)
  bottom: number;
  left: number;
  right: number;
  notch?: {
    width: number;
    height: number;
    centerX: number;
  };
  dynamicIsland?: {
    width: number;
    height: number;
    centerX: number;
  };
  thumbZone?: {
    bottom: number; // Height from bottom
    horizontal: number; // Width from sides
  };
}

/**
 * Device presets with safe areas
 */
export const DEVICE_SAFE_AREAS: Record<string, DeviceSafeAreas> = {
  'iPhone 16': {
    top: 0.059, // 50px / 844px (Dynamic Island)
    bottom: 0.040, // 34px / 844px (Home indicator)
    left: 0,
    right: 0,
    dynamicIsland: {
      width: 0.313, // 122px / 390px
      height: 0.045, // 38px / 844px
      centerX: 0.5,
    },
    thumbZone: {
      bottom: 0.166, // 140px / 844px
      horizontal: 0.128, // 50px / 390px
    },
  },
  'iPhone 14 Pro': {
    top: 0.059,
    bottom: 0.040,
    left: 0,
    right: 0,
    dynamicIsland: {
      width: 0.313,
      height: 0.045,
      centerX: 0.5,
    },
    thumbZone: {
      bottom: 0.166,
      horizontal: 0.128,
    },
  },
  'iPhone 13': {
    top: 0.056, // 47px / 844px (Notch)
    bottom: 0.040,
    left: 0,
    right: 0,
    notch: {
      width: 0.436, // 170px / 390px
      height: 0.035, // 30px / 844px
      centerX: 0.5,
    },
    thumbZone: {
      bottom: 0.166,
      horizontal: 0.128,
    },
  },
  'Pixel': {
    top: 0.036, // Status bar
    bottom: 0.024, // Navigation bar
    left: 0,
    right: 0,
    thumbZone: {
      bottom: 0.150,
      horizontal: 0.120,
    },
  },
  'iPad': {
    top: 0.024,
    bottom: 0.024,
    left: 0,
    right: 0,
    thumbZone: {
      bottom: 0.100,
      horizontal: 0.080,
    },
  },
  'Generic': {
    top: 0.050,
    bottom: 0.030,
    left: 0.020,
    right: 0.020,
    thumbZone: {
      bottom: 0.150,
      horizontal: 0.100,
    },
  },
};

/**
 * Get safe areas for device
 * 
 * @param deviceName - Device name
 * @returns Safe area configuration
 */
export function getSafeAreasForDevice(deviceName: string): DeviceSafeAreas {
  return DEVICE_SAFE_AREAS[deviceName] || DEVICE_SAFE_AREAS['Generic'];
}

/**
 * Check if point is in safe area
 * 
 * @param x - Normalized X (0-1)
 * @param y - Normalized Y (0-1)
 * @param deviceName - Device name
 * @returns Whether point is in safe area
 */
export function isInSafeArea(
  x: number,
  y: number,
  deviceName: string
): boolean {
  const safeAreas = getSafeAreasForDevice(deviceName);

  // Check if in unsafe zones
  if (y < safeAreas.top) return false;
  if (y > 1 - safeAreas.bottom) return false;
  if (x < safeAreas.left) return false;
  if (x > 1 - safeAreas.right) return false;

  return true;
}

/**
 * Get safe content area bounds
 * 
 * @param deviceName - Device name
 * @returns Safe content area { top, right, bottom, left }
 */
export function getSafeContentArea(deviceName: string) {
  const safeAreas = getSafeAreasForDevice(deviceName);

  return {
    top: safeAreas.top,
    right: 1 - safeAreas.right,
    bottom: 1 - safeAreas.bottom,
    left: safeAreas.left,
  };
}

/**
 * Clamp position to safe area
 * 
 * @param x - Normalized X
 * @param y - Normalized Y
 * @param width - Component width (normalized)
 * @param height - Component height (normalized)
 * @param deviceName - Device name
 * @returns Clamped position
 */
export function clampToSafeArea(
  x: number,
  y: number,
  width: number,
  height: number,
  deviceName: string
): { x: number; y: number } {
  const content = getSafeContentArea(deviceName);

  const clampedX = Math.max(
    content.left,
    Math.min(content.right - width, x)
  );

  const clampedY = Math.max(
    content.top,
    Math.min(content.bottom - height, y)
  );

  return { x: clampedX, y: clampedY };
}
