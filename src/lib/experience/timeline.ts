/**
 * Experience Timeline — Global Animation Priority Queue
 *
 * Every gameplay effect belongs to one timeline.
 * Nothing animates independently — everything queues, prioritizes, yields.
 *
 * Priority levels (lower number = higher priority):
 *   0  REVEAL       — wheel reveal sequence (nothing interrupts this)
 *   1  REVIVE       — squad revive sequence
 *   2  CHAMPIONSHIP — finals dramatic framing
 *   3  STEAL        — combat sequence
 *   4  GAMEPLAY     — general gameplay effects
 *   5  HUD          — counter updates, rank changes
 *   6  COSMETICS    — decorative effects
 */

export type TimelinePriority =
  | "reveal"
  | "revive"
  | "championship"
  | "steal"
  | "gameplay"
  | "hud"
  | "cosmetics";

const PRIORITY_ORDER: Record<TimelinePriority, number> = {
  reveal:       0,
  revive:       1,
  championship: 2,
  steal:        3,
  gameplay:     4,
  hud:          5,
  cosmetics:    6,
};

export type TimelineTaskStatus = "pending" | "running" | "complete" | "cancelled";

export interface TimelineTask {
  id: string;
  priority: TimelinePriority;
  durationMs: number;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  /** If true, pauses all lower-priority tasks when running */
  exclusive?: boolean;
  status: TimelineTaskStatus;
  startedAt?: number;
}

// ── Timeline Manager ───────────────────────────────────────────────────────

export class ExperienceTimeline {
  private queue: TimelineTask[] = [];
  private running: Set<string> = new Set();
  private paused: Set<string> = new Set();

  enqueue(task: Omit<TimelineTask, "status">): () => void {
    const full: TimelineTask = { ...task, status: "pending" };

    // Insert in priority order
    const insertAt = this.queue.findIndex(
      (t) => PRIORITY_ORDER[t.priority] > PRIORITY_ORDER[full.priority]
    );
    if (insertAt === -1) {
      this.queue.push(full);
    } else {
      this.queue.splice(insertAt, 0, full);
    }

    this.process();

    // Return cancel function
    return () => this.cancel(full.id);
  }

  private process(): void {
    if (this.queue.length === 0) return;

    const next = this.queue.find((t) => t.status === "pending");
    if (!next) return;

    // Check if exclusive task is blocking
    const exclusiveRunning = Array.from(this.running).some(
      (id) => this.getTask(id)?.exclusive
    );

    if (exclusiveRunning && next.priority !== "reveal") return;

    next.status = "running";
    next.startedAt = Date.now();
    this.running.add(next.id);

    // Pause lower-priority tasks if exclusive
    if (next.exclusive) {
      this.queue.forEach((t) => {
        if (t.id !== next.id && PRIORITY_ORDER[t.priority] > PRIORITY_ORDER[next.priority]) {
          if (t.status === "running") {
            t.status = "pending";
            this.running.delete(t.id);
            this.paused.add(t.id);
          }
        }
      });
    }

    next.onStart?.();

    setTimeout(() => {
      next.status = "complete";
      this.running.delete(next.id);
      next.onComplete?.();
      this.queue = this.queue.filter((t) => t.id !== next.id);

      // Resume paused tasks
      if (next.exclusive) {
        this.paused.forEach((id) => {
          const t = this.getTask(id);
          if (t) { t.status = "pending"; this.paused.delete(id); }
        });
      }

      this.process();
    }, next.durationMs);
  }

  cancel(id: string): void {
    const task = this.getTask(id);
    if (!task) return;
    task.status = "cancelled";
    this.running.delete(id);
    task.onCancel?.();
    this.queue = this.queue.filter((t) => t.id !== id);
  }

  cancelByPriority(priority: TimelinePriority): void {
    this.queue
      .filter((t) => t.priority === priority)
      .forEach((t) => this.cancel(t.id));
  }

  clear(): void {
    this.queue.forEach((t) => t.onCancel?.());
    this.queue = [];
    this.running.clear();
    this.paused.clear();
  }

  private getTask(id: string): TimelineTask | undefined {
    return this.queue.find((t) => t.id === id);
  }

  getQueueLength(): number { return this.queue.length; }
  getRunningCount(): number { return this.running.size; }

  debugSnapshot() {
    return {
      queue:   this.queue.map(({ id, priority, status, durationMs }) => ({ id, priority, status, durationMs })),
      running: Array.from(this.running),
      paused:  Array.from(this.paused),
    };
  }
}

export const experienceTimeline = new ExperienceTimeline();
