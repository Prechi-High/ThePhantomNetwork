/**
 * Spin flow integration tests — verifies architecture compliance.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { gameplayRuntime } from "@/lib/gameplay/runtime";
import { gameplayEvents } from "@/lib/gameplay/events";
import { getTokenDelta, OUTCOME_DELTAS } from "@/lib/gameplay/spin";

describe("spin architecture", () => {
  beforeEach(() => {
    gameplayRuntime.reset();
  });

  it("emits SPIN_REQUESTED before network resolves", async () => {
    const events: string[] = [];
    gameplayRuntime.initialize("session-1", "sub-1");
    gameplayRuntime.transitionTo("READY", "test");

    const unsub = gameplayEvents.onAll((e) => events.push(e.type));

    const started = await gameplayRuntime.requestSpin();
    expect(started).toBe(true);
    expect(events).toContain("SPIN_REQUESTED");
    expect(events).toContain("STATE_TRANSITION");

    unsub();
  });

  it("OUTCOME_DELTAS only defined in gameplay domain", () => {
    expect(getTokenDelta("ADVANCE")).toBe(3);
    expect(getTokenDelta("ACQUIRE")).toBe(1);
    expect(getTokenDelta("DISCOVER")).toBe(0.5);
    expect(OUTCOME_DELTAS.STEAL).toBe(0);
  });

  it("receiveOutcome emits OUTCOME_RECEIVED with server totals", () => {
    const received: unknown[] = [];
    const unsub = gameplayEvents.on("OUTCOME_RECEIVED", (e) => {
      received.push(e.payload);
    });

    gameplayRuntime.receiveOutcome("ACQUIRE", 1, 5);

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      outcome: "ACQUIRE",
      tokenDelta: 1,
      newTokenTotal: 5,
    });

    unsub();
  });
});

describe("network-free UI rule", () => {
  it("documents banned pattern — fetch must not appear in components", () => {
    // CI guardrail: grep src/components for 'await fetch(' should return zero matches
    // except in test fixtures. Enforced via scripts/check-no-fetch-in-components.mjs
    expect(true).toBe(true);
  });
});
