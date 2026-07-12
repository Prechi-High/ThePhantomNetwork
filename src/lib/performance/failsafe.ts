/**
 * Failsafe System — Isolated Subsystem Error Handling
 *
 * Every subsystem can fail independently without breaking gameplay.
 * If Voice fails → gameplay continues.
 * If Particles fail → gameplay continues.
 * If Audio fails → gameplay continues.
 *
 * Failure categories:
 *   runtime        — core gameplay engine
 *   network        — SSE / API calls
 *   store          — Zustand store mutations
 *   animation      — Framer Motion / CSS
 *   audio          — Audio playback
 *   rendering      — React rendering errors
 *   synchronization — Realtime sync
 *   session        — Session lifecycle
 *   world          — Living world features
 *   particles      — Particle system
 */

export type FailureCategory =
  | "runtime"
  | "network"
  | "store"
  | "animation"
  | "audio"
  | "rendering"
  | "synchronization"
  | "session"
  | "world"
  | "particles"
  | "unknown";

export type FailureSeverity = "low" | "medium" | "high" | "critical";

export interface FailureRecord {
  id:         string;
  category:   FailureCategory;
  severity:   FailureSeverity;
  message:    string;
  context?:   Record<string, unknown>;
  timestamp:  number;
  recovered:  boolean;
  /** Whether gameplay was interrupted */
  impacted:   boolean;
}

// ── Recovery strategies ───────────────────────────────────────────────────

const RECOVERY_STRATEGIES: Record<FailureCategory, { canContinue: boolean; action: string }> = {
  runtime:         { canContinue: false, action: "reload_session" },
  network:         { canContinue: true,  action: "reconnect_with_backoff" },
  store:           { canContinue: true,  action: "reset_affected_store" },
  animation:       { canContinue: true,  action: "skip_animation" },
  audio:           { canContinue: true,  action: "mute_audio_layer" },
  rendering:       { canContinue: true,  action: "remount_component" },
  synchronization: { canContinue: true,  action: "resync_from_server" },
  session:         { canContinue: false, action: "return_to_lobby" },
  world:           { canContinue: true,  action: "disable_world_features" },
  particles:       { canContinue: true,  action: "disable_particles" },
  unknown:         { canContinue: true,  action: "log_and_continue" },
};

// ── Failsafe Manager ──────────────────────────────────────────────────────

class FailsafeManager {
  private failures: FailureRecord[] = [];
  private disabledSubsystems: Set<FailureCategory> = new Set();
  private maxFailures = 100;
  private listeners: Set<(record: FailureRecord) => void> = new Set();

  /** Record a failure. Returns whether gameplay can continue. */
  record(
    category:  FailureCategory,
    severity:  FailureSeverity,
    message:   string,
    context?:  Record<string, unknown>,
  ): boolean {
    const strategy = RECOVERY_STRATEGIES[category];

    const record: FailureRecord = {
      id:        `fail-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      category,
      severity,
      message,
      context,
      timestamp: Date.now(),
      recovered: strategy.canContinue,
      impacted:  !strategy.canContinue,
    };

    this.failures.unshift(record);
    if (this.failures.length > this.maxFailures) this.failures.pop();

    // Disable subsystem on repeated failures
    const recentSame = this.failures
      .slice(0, 10)
      .filter((f) => f.category === category).length;

    if (recentSame >= 3 && strategy.canContinue) {
      this.disabledSubsystems.add(category);
      console.warn(`[Failsafe] Disabling subsystem after repeated failures: ${category}`);
    }

    // Log to console in all environments
    const logFn = severity === "critical" || severity === "high" ? console.error : console.warn;
    logFn(`[Failsafe] ${category}:${severity} — ${message}`, context ?? "");

    this.listeners.forEach((fn) => fn(record));

    return strategy.canContinue;
  }

  /** Wrap a function with automatic failsafe handling */
  wrap<T>(
    category: FailureCategory,
    fn: () => T,
    fallback?: T,
  ): T | undefined {
    if (this.isDisabled(category)) return fallback;
    try {
      return fn();
    } catch (err) {
      this.record(category, "medium", err instanceof Error ? err.message : String(err));
      return fallback;
    }
  }

  /** Wrap an async function with failsafe */
  async wrapAsync<T>(
    category: FailureCategory,
    fn: () => Promise<T>,
    fallback?: T,
  ): Promise<T | undefined> {
    if (this.isDisabled(category)) return fallback;
    try {
      return await fn();
    } catch (err) {
      this.record(category, "medium", err instanceof Error ? err.message : String(err));
      return fallback;
    }
  }

  isDisabled(category: FailureCategory): boolean {
    return this.disabledSubsystems.has(category);
  }

  enableSubsystem(category: FailureCategory): void {
    this.disabledSubsystems.delete(category);
  }

  getFailures(category?: FailureCategory): FailureRecord[] {
    return category
      ? this.failures.filter((f) => f.category === category)
      : [...this.failures];
  }

  getDisabledSubsystems(): FailureCategory[] {
    return Array.from(this.disabledSubsystems);
  }

  onFailure(fn: (record: FailureRecord) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getHealth(): Record<FailureCategory, "healthy" | "degraded" | "disabled"> {
    const cats: FailureCategory[] = [
      "runtime","network","store","animation","audio",
      "rendering","synchronization","session","world","particles","unknown",
    ];
    return Object.fromEntries(
      cats.map((c) => [
        c,
        this.isDisabled(c) ? "disabled"
          : this.failures.filter((f) => f.category === c).length > 0 ? "degraded"
          : "healthy",
      ])
    ) as Record<FailureCategory, "healthy" | "degraded" | "disabled">;
  }
}

export const failsafe = new FailsafeManager();
