/**
 * HapticManager — wraps experience haptics with registry patterns
 */

import { haptics, GAMEPLAY_HAPTICS, type HapticPattern } from "@/lib/experience/haptics";

const DIRECT_PATTERNS = new Set<HapticPattern>([
  "none",
  "light",
  "medium",
  "heavy",
  "heartbeat",
  "double",
  "triple",
]);

export class HapticManager {
  trigger(patternId: string): void {
    const pattern = GAMEPLAY_HAPTICS[patternId];
    if (pattern) {
      haptics.trigger(pattern);
      return;
    }
    if (DIRECT_PATTERNS.has(patternId as HapticPattern)) {
      haptics.trigger(patternId as HapticPattern);
    }
  }

  setEnabled(enabled: boolean): void {
    haptics.setEnabled(enabled);
  }

  cancel(): void {
    haptics.cancel();
  }
}

export const hapticManager = new HapticManager();
