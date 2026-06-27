import {
  SPIN_OUTCOME_WEIGHTS,
  type SpinOutcome,
  type SpinResult,
} from "@/types/gameplay";

const OUTCOME_DELTAS: Record<SpinOutcome, number> = {
  ADVANCE: 3,
  ACQUIRE: 1,
  DISCOVER: 0.5,
  STEAL: 0,
  VOID: 0,
};

export function rollSpinOutcome(seed?: number): SpinResult {
  const totalWeight = Object.values(SPIN_OUTCOME_WEIGHTS).reduce((a, b) => a + b, 0);
  const rand = seed !== undefined ? seededRandom(seed) : Math.random();
  let cumulative = 0;
  let outcome: SpinOutcome = "VOID";

  for (const [key, weight] of Object.entries(SPIN_OUTCOME_WEIGHTS)) {
    cumulative += weight / totalWeight;
    if (rand <= cumulative) {
      outcome = key as SpinOutcome;
      break;
    }
  }

  return {
    outcome,
    tokenDelta: OUTCOME_DELTAS[outcome],
    animationSeed: seed ?? Math.floor(Math.random() * 1000000),
  };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function applySpinTokens(currentTokens: number, outcome: SpinOutcome): number {
  const delta = OUTCOME_DELTAS[outcome];
  return Math.round((currentTokens + delta) * 10) / 10;
}
