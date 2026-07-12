/**
 * Gameplay Analytics — Meaningful Behavior Tracking
 *
 * Tracks gameplay events that improve the product, not vanity metrics.
 * Privacy-respecting: no PII beyond userId.
 *
 * Events tracked:
 *   session_entered        — player starts session
 *   session_abandoned      — player leaves mid-session
 *   first_spin             — first spin of a session
 *   spin_completed         — spin + reveal done
 *   reveal_duration        — how long the reveal took
 *   skill_used             — which skill, from which context
 *   steal_attempted        — steal outcome + amount
 *   revive_contributed     — revive contribution amount
 *   phase_progressed       — reached a new phase
 *   championship_qualified — entered championship bracket
 *   session_completed      — reached the end
 *   return_after_absence   — returned after X hours
 */

export type AnalyticsEventName =
  | "session_entered"
  | "session_abandoned"
  | "first_spin"
  | "spin_completed"
  | "reveal_duration"
  | "skill_used"
  | "steal_attempted"
  | "revive_contributed"
  | "phase_progressed"
  | "championship_qualified"
  | "session_completed"
  | "return_after_absence"
  | "error_occurred";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  userId?: string;
  sessionId?: string;
  subSessionId?: string;
  properties?: Record<string, string | number | boolean | null>;
  timestamp: number;
}

// ── Analytics Engine ──────────────────────────────────────────────────────

type AnalyticsAdapter = (event: AnalyticsEvent) => void;

class GameplayAnalytics {
  private adapters: AnalyticsAdapter[] = [];
  private queue:    AnalyticsEvent[]   = [];
  private enabled = true;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /** Register an analytics backend (Posthog, Mixpanel, custom, etc.) */
  addAdapter(adapter: AnalyticsAdapter): void {
    this.adapters.push(adapter);
  }

  /** Track an event — batches in development, flushes immediately in production */
  track(
    name: AnalyticsEventName,
    properties?: AnalyticsEvent["properties"],
    context?: Pick<AnalyticsEvent, "userId" | "sessionId" | "subSessionId">,
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      ...context,
    };

    this.queue.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, process.env.NODE_ENV === "production" ? 200 : 2000);
  }

  private flush(): void {
    const batch = this.queue.splice(0);
    for (const event of batch) {
      for (const adapter of this.adapters) {
        try { adapter(event); } catch {/* adapter failure never breaks gameplay */}
      }
    }
  }

  setEnabled(enabled: boolean): void { this.enabled = enabled; }
  isEnabled(): boolean { return this.enabled; }

  // ── Typed convenience methods ───────────────────────────────────────────

  sessionEntered(userId: string, sessionId: string, subSessionId: string): void {
    this.track("session_entered", { sessionId }, { userId, sessionId, subSessionId });
  }

  sessionAbandoned(userId: string, sessionId: string, phase: number, tokens: number): void {
    this.track("session_abandoned", { phase, tokens }, { userId, sessionId });
  }

  firstSpin(userId: string, subSessionId: string): void {
    this.track("first_spin", {}, { userId, subSessionId });
  }

  spinCompleted(
    userId: string,
    subSessionId: string,
    outcome: string,
    tokenDelta: number,
    spinNumber: number,
  ): void {
    this.track("spin_completed", { outcome, tokenDelta, spinNumber }, { userId, subSessionId });
  }

  revealDuration(userId: string, subSessionId: string, durationMs: number, outcome: string): void {
    this.track("reveal_duration", { durationMs, outcome }, { userId, subSessionId });
  }

  skillUsed(userId: string, subSessionId: string, skillId: string, phase: number): void {
    this.track("skill_used", { skillId, phase }, { userId, subSessionId });
  }

  stealAttempted(userId: string, subSessionId: string, success: boolean, amount: number, boosted: boolean): void {
    this.track("steal_attempted", { success, amount, boosted }, { userId, subSessionId });
  }

  reviveContributed(userId: string, subSessionId: string, amount: number): void {
    this.track("revive_contributed", { amount }, { userId, subSessionId });
  }

  phaseProgressed(userId: string, subSessionId: string, phase: number, tokens: number, rank: number): void {
    this.track("phase_progressed", { phase, tokens, rank }, { userId, subSessionId });
  }

  championshipQualified(userId: string, sessionId: string, rank: number, tokens: number): void {
    this.track("championship_qualified", { rank, tokens }, { userId, sessionId });
  }

  sessionCompleted(userId: string, sessionId: string, finalRank: number, totalTokens: number): void {
    this.track("session_completed", { finalRank, totalTokens }, { userId, sessionId });
  }

  returnAfterAbsence(userId: string, absentHours: number): void {
    this.track("return_after_absence", { absentHours }, { userId });
  }

  errorOccurred(area: string, severity: string, message: string, userId?: string): void {
    this.track("error_occurred", { area, severity, message: message.slice(0, 200) }, { userId });
  }
}

export const gameplayAnalytics = new GameplayAnalytics();

// ── Console adapter for development ───────────────────────────────────────

if (process.env.NODE_ENV === "development") {
  gameplayAnalytics.addAdapter((event) => {
    console.log(`[Analytics] ${event.name}`, event.properties ?? "");
  });
}
