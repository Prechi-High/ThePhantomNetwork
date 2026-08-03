/** Legacy War — V1 spec constants and helpers */

export const LEGACY_WAR_CYCLE_DAYS = 90;
export const LEGACY_WAR_DURATION_DAYS = 7;

export const LEGACY_WAR_PHASES = {
  mobilization: { days: 2, label: "Mobilization" },
  warCampaign: { days: 4, label: "War Campaign" },
  finalStand: { days: 1, label: "Final Stand" },
} as const;

export const CHAMPION_REWARD_SPLITS = {
  champion: 0.5,
  second: 0.2,
  third: 0.1,
  remainingQualified: 0.2,
} as const;

export function accumulateWarReserve(sessionPoolCents: number, reserveRate = 0.05): number {
  return Math.round(sessionPoolCents * reserveRate);
}

export function distributeWarReserve(totalReserveCents: number, qualifiedCampCount: number) {
  const champion = Math.round(totalReserveCents * CHAMPION_REWARD_SPLITS.champion);
  const second = Math.round(totalReserveCents * CHAMPION_REWARD_SPLITS.second);
  const third = Math.round(totalReserveCents * CHAMPION_REWARD_SPLITS.third);
  const remainingPool = Math.round(totalReserveCents * CHAMPION_REWARD_SPLITS.remainingQualified);
  const perRemaining = qualifiedCampCount > 3
    ? Math.floor(remainingPool / (qualifiedCampCount - 3))
    : 0;
  return { champion, second, third, remainingPool, perRemainingCamp: perRemaining };
}
