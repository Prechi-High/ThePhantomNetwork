/**
 * Performance Budget
 *
 * Strict timing budgets for every gameplay subsystem.
 * Target: 60 FPS = 16.6ms per frame.
 *
 * Used by the PerformanceMonitor to flag violations.
 */

export const FRAME_BUDGET_MS = 16.6;

/** Per-subsystem budgets in ms */
export const SUBSYSTEM_BUDGETS = {
  ui:         3,
  animations: 4,
  particles:  2,
  runtime:    3,
  network:    1,
  other:      3,
} as const;

/** Memory budgets per category (MB, approximate targets) */
export const MEMORY_BUDGETS_MB = {
  hud:        20,
  particles:  10,
  animations: 10,
  audio:      25,
  textures:   40,
  runtime:    15,
} as const;

export type SubsystemName = keyof typeof SUBSYSTEM_BUDGETS;
export type MemoryCategory = keyof typeof MEMORY_BUDGETS_MB;

// ── Performance Monitor ───────────────────────────────────────────────────

interface TimingEntry {
  subsystem: SubsystemName;
  durationMs: number;
  timestamp: number;
  violation: boolean;
}

export class PerformanceMonitor {
  private entries:  TimingEntry[] = [];
  private maxEntries = 300;
  private enabled = process.env.NODE_ENV === "development";

  /** Measure a synchronous block */
  measure<T>(subsystem: SubsystemName, fn: () => T): T {
    if (!this.enabled) return fn();
    const t0 = performance.now();
    const result = fn();
    const duration = performance.now() - t0;
    this.record(subsystem, duration);
    return result;
  }

  /** Measure an async block */
  async measureAsync<T>(subsystem: SubsystemName, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();
    const t0 = performance.now();
    const result = await fn();
    const duration = performance.now() - t0;
    this.record(subsystem, duration);
    return result;
  }

  private record(subsystem: SubsystemName, durationMs: number): void {
    const budget    = SUBSYSTEM_BUDGETS[subsystem];
    const violation = durationMs > budget;

    if (violation) {
      console.warn(
        `[PerformanceMonitor] Budget exceeded — ${subsystem}: ${durationMs.toFixed(2)}ms (budget: ${budget}ms)`
      );
    }

    this.entries.push({ subsystem, durationMs, timestamp: Date.now(), violation });
    if (this.entries.length > this.maxEntries) this.entries.shift();
  }

  getViolations(): TimingEntry[] {
    return this.entries.filter((e) => e.violation);
  }

  getAverages(): Record<SubsystemName, number> {
    const sums: Partial<Record<SubsystemName, { total: number; count: number }>> = {};
    for (const e of this.entries) {
      if (!sums[e.subsystem]) sums[e.subsystem] = { total: 0, count: 0 };
      sums[e.subsystem]!.total += e.durationMs;
      sums[e.subsystem]!.count++;
    }
    const result = {} as Record<SubsystemName, number>;
    for (const [k, v] of Object.entries(sums)) {
      result[k as SubsystemName] = v!.total / v!.count;
    }
    return result;
  }

  clear(): void { this.entries = []; }

  getReport() {
    return {
      totalSamples:    this.entries.length,
      violations:      this.getViolations().length,
      averages:        this.getAverages(),
      budgets:         SUBSYSTEM_BUDGETS,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
