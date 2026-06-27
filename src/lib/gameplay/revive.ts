import { REVIVE_COST } from "@/types/gameplay";

export interface ReviveState {
  targetUserId: string;
  required: number;
  contributed: number;
  contributors: { userId: string; amount: number }[];
}

export function initReviveState(targetUserId: string): ReviveState {
  return {
    targetUserId,
    required: REVIVE_COST,
    contributed: 0,
    contributors: [],
  };
}

export function contributeToRevive(
  state: ReviveState,
  contributorId: string,
  amount: number
): ReviveState {
  const newContributed = state.contributed + amount;
  return {
    ...state,
    contributed: newContributed,
    contributors: [...state.contributors, { userId: contributorId, amount }],
  };
}

export function isReviveComplete(state: ReviveState): boolean {
  return state.contributed >= state.required;
}
