import crypto from "crypto";
import type { SpinOutcome } from "@/types/gameplay";

export interface ProvablyFairSpin {
  spinId: string;
  serverSeed: string;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  randomFloat: number;
  winningIndex: number;
  winningSector: SpinOutcome;
  targetAngle: number;
  timestamp: number;
}

// Helper to generate a random seed
export const generateSeed = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Helper to hash a seed (SHA256)
export const hashSeed = (seed: string): string => {
  return crypto.createHash("sha256").update(seed).digest("hex");
};

// Helper to generate a provably fair random float [0, 1)
export const generateProvablyFairRandom = (
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number => {
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = crypto.createHmac("sha256", serverSeed).update(combined).digest("hex");
  // Use first 8 bytes of hash to generate float
  const hexSegment = hash.slice(0, 16); // 8 bytes = 16 hex chars
  const intValue = parseInt(hexSegment, 16);
  return intValue / 0xffffffffffffffff; // Normalize to [0, 1)
};

// Map winning index to sector (0-4)
export const getSectorFromIndex = (index: number): SpinOutcome => {
  const sectors: SpinOutcome[] = ["ADVANCE", "ACQUIRE", "DISCOVER", "STEAL", "VOID"];
  return sectors[index % 5];
};

// Get the token delta for a spin outcome
const OUTCOME_DELTAS: Record<SpinOutcome, number> = {
  ADVANCE: 3,
  ACQUIRE: 1,
  DISCOVER: 0.5,
  STEAL: 0,
  VOID: 0,
};

// Full provably fair spin generation
export const rollSpinOutcome = (
  existingServerSeed?: string,
  existingNonce?: number
): ProvablyFairSpin => {
  const serverSeed = existingServerSeed || generateSeed();
  const clientSeed = generateSeed();
  const nonce = existingNonce !== undefined ? existingNonce : Date.now();
  const randomFloat = generateProvablyFairRandom(serverSeed, clientSeed, nonce);
  const winningIndex = Math.floor(randomFloat * 5); // Exactly 20% chance per sector
  const winningSector = getSectorFromIndex(winningIndex);

  return {
    spinId: crypto.randomUUID(),
    serverSeed,
    hashedServerSeed: hashSeed(serverSeed),
    clientSeed,
    nonce,
    randomFloat,
    winningIndex,
    winningSector,
    targetAngle: 0, // To be set from config
    timestamp: Date.now(),
  };
};

// Apply spin outcome to current tokens
export const applySpinTokens = (currentTokens: number, outcome: SpinOutcome): number => {
  const delta = OUTCOME_DELTAS[outcome];
  return Math.round((currentTokens + delta) * 10) / 10;
};
