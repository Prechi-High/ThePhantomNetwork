/**
 * Event validation utilities for real-time updates
 * Ensures events are valid and not out-of-order
 */

interface EventState {
  timestamp: string;
  sequenceId?: number;
}

/**
 * Validates that an event is not out-of-order
 * Compares event timestamp with last known state timestamp
 *
 * Returns true if event is valid and should be processed
 */
export function validateEventOrder(
  event: EventState,
  lastState: EventState | null
): boolean {
  // No previous state, event is valid
  if (!lastState) {
    return true;
  }

  const eventTime = new Date(event.timestamp).getTime();
  const lastTime = new Date(lastState.timestamp).getTime();

  // Reject events older than 5 seconds (tolerance for clock skew)
  if (eventTime < lastTime - 5000) {
    console.warn(
      `Out-of-order event rejected: event time ${eventTime} < last time ${lastTime}`
    );
    return false;
  }

  return true;
}

/**
 * Validates a raw event object has required fields
 */
export function validateEventStructure(event: unknown): event is Record<string, unknown> {
  if (!event || typeof event !== "object") {
    return false;
  }

  const obj = event as Record<string, unknown>;

  // Check for required fields
  if (!obj.type || typeof obj.type !== "string") {
    console.warn("Event missing required 'type' field");
    return false;
  }

  return true;
}

/**
 * Validates a live feed event has expected fields
 */
export function validateLiveFeedEvent(event: unknown): boolean {
  if (!validateEventStructure(event)) {
    return false;
  }

  const obj = event as Record<string, unknown>;

  if (obj.type === "livefeed:event") {
    const payload = obj.payload as Record<string, unknown> | undefined;
    if (!payload || !payload.id || !payload.timestamp) {
      console.warn("Invalid livefeed event payload");
      return false;
    }
  }

  return true;
}

/**
 * Validates a leaderboard update event
 */
export function validateLeaderboardEvent(event: unknown): boolean {
  if (!validateEventStructure(event)) {
    return false;
  }

  const obj = event as Record<string, unknown>;

  if (obj.type === "leaderboard:updated") {
    const payload = obj.payload as Record<string, unknown> | undefined;
    if (!payload || !payload.user_id || payload.new_rank === undefined) {
      console.warn("Invalid leaderboard event payload");
      return false;
    }
  }

  return true;
}

/**
 * Detects if an event is significantly out of order
 * Returns true if gap detection should trigger full state refresh
 */
export function shouldRefreshState(
  eventGapMs: number,
  threshold: number = 60000 // 60 seconds
): boolean {
  return eventGapMs > threshold;
}

/**
 * Validates timestamp format (ISO 8601)
 */
export function isValidTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
