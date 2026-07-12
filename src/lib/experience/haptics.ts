/**
 * Haptics — Mobile Tactile Feedback
 *
 * Tiny, intentional vibrations. Never annoying.
 * Only on mobile devices that support the Vibration API.
 * Each gameplay event has its own haptic signature.
 *
 * Intensities:
 *   light   — button tap, discover, token tick
 *   medium  — acquire, rank up, shield activate
 *   heavy   — advance, steal, revive complete, championship
 *   heartbeat — revive sequence (ba-DUM pattern)
 *   none    — void, ambient events
 */

export type HapticPattern =
  | "none"
  | "light"
  | "medium"
  | "heavy"
  | "heartbeat"
  | "double"
  | "triple";

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  none:      [],
  light:     [20],
  medium:    [40],
  heavy:     [80],
  double:    [30, 50, 30],
  triple:    [25, 40, 25, 40, 25],
  heartbeat: [60, 80, 140, 80],
};

// ── Haptics Controller ────────────────────────────────────────────────────

class HapticsController {
  private enabled = true;
  private supported = false;

  constructor() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      this.supported = true;
    }
  }

  trigger(pattern: HapticPattern): void {
    if (!this.enabled || !this.supported || pattern === "none") return;
    const sequence = HAPTIC_PATTERNS[pattern];
    if (sequence.length === 0) return;
    try {
      navigator.vibrate(sequence);
    } catch {/* not supported on this device */}
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.cancel();
  }

  cancel(): void {
    if (this.supported) {
      try { navigator.vibrate(0); } catch {/* safe */}
    }
  }

  isSupported(): boolean { return this.supported; }
  isEnabled(): boolean   { return this.enabled; }
}

export const haptics = new HapticsController();

// ── Gameplay event → haptic map ───────────────────────────────────────────

export const GAMEPLAY_HAPTICS: Record<string, HapticPattern> = {
  engage:           "light",
  spin_start:       "none",
  spin_lock:        "medium",
  reveal_advance:   "heavy",
  reveal_acquire:   "medium",
  reveal_discover:  "light",
  reveal_steal:     "heavy",
  reveal_void:      "light",
  token_collected:  "light",
  steal_executed:   "double",
  revive_sequence:  "heartbeat",
  revive_complete:  "heavy",
  championship:     "triple",
  elimination:      "medium",
  rank_up:          "medium",
  shield_triggered: "medium",
  button_tap:       "light",
};
