/** Official Session prize pool splits — Arena Economy V1 */

export const PRIZE_POOL_SPLITS = {
  platform: 0.2,
  winningSquad: 0.5,
  runnerUpSquads: 0.2,
  campRewardPool: 0.05,
  legacyWarReserve: 0.05,
} as const;

export const CAMP_TREASURY_SPLIT = {
  campTreasury: 0.8,
  squadTreasury: 0.2,
} as const;

export function distributePrizePool(totalCents: number) {
  return {
    platform: Math.round(totalCents * PRIZE_POOL_SPLITS.platform),
    winningSquad: Math.round(totalCents * PRIZE_POOL_SPLITS.winningSquad),
    runnerUpSquads: Math.round(totalCents * PRIZE_POOL_SPLITS.runnerUpSquads),
    campRewardPool: Math.round(totalCents * PRIZE_POOL_SPLITS.campRewardPool),
    legacyWarReserve: Math.round(totalCents * PRIZE_POOL_SPLITS.legacyWarReserve),
  };
}

export function splitCampReward(campRewardCents: number) {
  return {
    campTreasury: Math.round(campRewardCents * CAMP_TREASURY_SPLIT.campTreasury),
    squadTreasury: Math.round(campRewardCents * CAMP_TREASURY_SPLIT.squadTreasury),
  };
}

/** 6 official sessions per day, every 4 hours */
export const OFFICIAL_SESSIONS_PER_DAY = 6;
export const OFFICIAL_SESSION_INTERVAL_HOURS = 4;
export const SESSION_DURATION_MINUTES = 20;
