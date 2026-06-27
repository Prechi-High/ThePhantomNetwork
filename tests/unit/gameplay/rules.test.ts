import { describe, it, expect } from "vitest";
import { rollSpinOutcome, applySpinTokens } from "@/lib/gameplay/spin";
import { classifyPhase1 } from "@/lib/gameplay/elimination";
import { buildStealTargets, computeStealAmount } from "@/lib/gameplay/steal";
import { contributeToRevive, isReviveComplete } from "@/lib/gameplay/revive";
import { validateSpecExample } from "@/lib/gameplay/economy";
import { createSubSessions } from "@/lib/gameplay/matchmaking";

describe("spin engine", () => {
  it("returns valid outcomes", () => {
    const result = rollSpinOutcome(42);
    expect(["ADVANCE", "ACQUIRE", "DISCOVER", "STEAL", "VOID"]).toContain(result.outcome);
  });

  it("applies token deltas", () => {
    expect(applySpinTokens(10, "ADVANCE")).toBe(13);
    expect(applySpinTokens(10, "DISCOVER")).toBe(10.5);
  });
});

describe("elimination", () => {
  const config = { target: 38, revivable_min: 35, revivable_max: 37.5, eliminated_below: 35 };

  it("classifies phase 1 correctly", () => {
    expect(classifyPhase1(40, config)).toBe("passed");
    expect(classifyPhase1(36, config)).toBe("revivable");
    expect(classifyPhase1(30, config)).toBe("eliminated");
  });
});

describe("steal engine", () => {
  it("builds targets from top 3 and rivals", () => {
    const candidates = [
      { userId: "a", username: "A", tokens: 50, tokenScore: 50, rivalryScore: 0, recentStealScore: 0 },
      { userId: "b", username: "B", tokens: 40, tokenScore: 40, rivalryScore: 0, recentStealScore: 0 },
      { userId: "c", username: "C", tokens: 30, tokenScore: 30, rivalryScore: 0, recentStealScore: 0 },
      { userId: "d", username: "D", tokens: 20, tokenScore: 20, rivalryScore: 100, recentStealScore: 0 },
    ];
    const targets = buildStealTargets(candidates, new Set(["d"]));
    expect(targets.some((t) => t.userId === "d")).toBe(true);
    expect(targets.length).toBeGreaterThan(0);
  });

  it("computes steal with fire boost", () => {
    expect(computeStealAmount(1, 3, false)).toBe(4);
    expect(computeStealAmount(1, 5, true)).toBe(9);
  });
});

describe("revive", () => {
  it("completes when enough contributed", () => {
    let state = { targetUserId: "b", required: 3, contributed: 0, contributors: [] };
    state = contributeToRevive(state, "a", 2);
    state = contributeToRevive(state, "c", 1);
    expect(isReviveComplete(state)).toBe(true);
  });
});

describe("economy", () => {
  it("validates spec platform fee example", () => {
    expect(validateSpecExample()).toBe(true);
  });
});

describe("matchmaking", () => {
  it("preserves squads in same sub-session", () => {
    const players = [
      { userId: "a", squadId: "s1", squadMemberIds: ["a", "b"], isPermanentSquad: true },
      { userId: "b", squadId: "s1", squadMemberIds: ["a", "b"], isPermanentSquad: true },
    ];
    const subs = createSubSessions(players);
    expect(subs.length).toBe(1);
    expect(subs[0].players.length).toBe(2);
  });
});
