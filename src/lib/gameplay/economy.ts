import type { EconomyConfig, PayoutBreakdown } from "@/types/gameplay";

export interface RankedPlayer {
  userId: string;
  rank: number;
  tokens: number;
  squadId?: string;
  isPermanentSquad: boolean;
}

export interface EconomyResult {
  payouts: Map<string, PayoutBreakdown>;
  platformFee: number;
  reconciliation: { total: number; expected: number; success: boolean };
}

export function calculateSessionEconomy(
  players: RankedPlayer[],
  entryFeeCents: number,
  platformFeePct: number,
  config: EconomyConfig,
  winnerSquadMembers: { userId: string; tokens: number }[]
): EconomyResult {
  const playerCount = players.length;
  const totalPool = playerCount * entryFeeCents;
  const platformFee = Math.round(totalPool * (platformFeePct / 100));
  const winnerAllocation = Math.round(totalPool * (config.winner_pct / 100));

  let remaining = totalPool - platformFee - winnerAllocation;

  const payouts = new Map<string, PayoutBreakdown>();
  const winner = players.find((p) => p.rank === 1);
  if (winner) {
    payouts.set(winner.userId, {
      winnerAllocation,
      total: winnerAllocation,
    });
  }

  const refundTotal = config.refund_ranks.length * entryFeeCents;
  for (const rank of config.refund_ranks) {
    const player = players.find((p) => p.rank === rank);
    if (player) {
      const existing = payouts.get(player.userId) ?? { total: 0 };
      payouts.set(player.userId, {
        ...existing,
        refund: entryFeeCents,
        total: existing.total + entryFeeCents,
      });
    }
  }
  remaining -= refundTotal;

  const performancePool = Math.round(
    remaining * (config.performance_pool_pct / 100)
  );
  const winnerSquadPool = remaining - performancePool;

  const performancePlayers = players.filter((p) =>
    config.performance_ranks.includes(p.rank)
  );
  const perfTokenTotal = performancePlayers.reduce((s, p) => s + p.tokens, 0);

  for (const p of performancePlayers) {
    const share = perfTokenTotal > 0 ? p.tokens / perfTokenTotal : 0;
    const amount = Math.round(performancePool * share);
    const existing = payouts.get(p.userId) ?? { total: 0 };
    payouts.set(p.userId, {
      ...existing,
      performance: amount,
      total: existing.total + amount,
    });
  }

  const squadTokenTotal = winnerSquadMembers.reduce((s, m) => s + m.tokens, 0);
  for (const m of winnerSquadMembers) {
    const share = squadTokenTotal > 0 ? m.tokens / squadTokenTotal : 0;
    const amount = Math.round(winnerSquadPool * share);
    const existing = payouts.get(m.userId) ?? { total: 0 };
    payouts.set(m.userId, {
      ...existing,
      squadShare: amount,
      total: existing.total + amount,
    });
  }

  const payoutSum = Array.from(payouts.values()).reduce((s, p) => s + p.total, 0);

  return {
    payouts,
    platformFee,
    reconciliation: {
      total: platformFee + payoutSum,
      expected: totalPool,
      success: platformFee + payoutSum === totalPool,
    },
  };
}

// Validate with spec example: 100 players, $5 entry, $500 pool
export function validateSpecExample(): boolean {
  const players: RankedPlayer[] = [
    { userId: "winner", rank: 1, tokens: 200, isPermanentSquad: true },
    { userId: "r2", rank: 2, tokens: 181, isPermanentSquad: true },
    { userId: "r3", rank: 3, tokens: 180, isPermanentSquad: true },
    { userId: "r4", rank: 4, tokens: 159, isPermanentSquad: true },
    { userId: "r5", rank: 5, tokens: 157, isPermanentSquad: true },
    { userId: "r6", rank: 6, tokens: 150, isPermanentSquad: true },
    ...Array.from({ length: 94 }, (_, i) => ({
      userId: `r${i + 7}`,
      rank: i + 7,
      tokens: 100 - i,
      isPermanentSquad: false,
    })),
  ];

  const config: EconomyConfig = {
    winner_pct: 25,
    refund_ranks: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    performance_ranks: [2, 3, 4, 5, 6],
    performance_pool_pct: 60,
    winner_squad_pool_pct: 40,
  };

  const result = calculateSessionEconomy(
    players,
    500,
    15,
    config,
    [
      { userId: "sq1", tokens: 133 },
      { userId: "sq2", tokens: 85 },
      { userId: "sq3", tokens: 23 },
      { userId: "sq4", tokens: 91 },
    ]
  );

  return result.platformFee === 7500;
}
