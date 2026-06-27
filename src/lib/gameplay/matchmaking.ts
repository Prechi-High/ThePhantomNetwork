import { SUB_SESSION_MAX_PLAYERS } from "@/types/gameplay";

export interface MatchmakingPlayer {
  userId: string;
  squadId?: string;
  squadMemberIds?: string[];
  isPermanentSquad: boolean;
}

export interface SubSessionAssignment {
  label: string;
  players: MatchmakingPlayer[];
}

export function createSubSessions(
  players: MatchmakingPlayer[]
): SubSessionAssignment[] {
  const subSessions: SubSessionAssignment[] = [];
  const squadGroups = new Map<string, MatchmakingPlayer[]>();
  const solos: MatchmakingPlayer[] = [];

  for (const player of players) {
    if (player.isPermanentSquad && player.squadId && player.squadMemberIds) {
      if (!squadGroups.has(player.squadId)) {
        squadGroups.set(player.squadId, []);
      }
      const group = squadGroups.get(player.squadId)!;
      if (!group.some((p) => p.userId === player.userId)) {
        group.push(player);
      }
    } else if (!player.squadId) {
      solos.push(player);
    }
  }

  const units: MatchmakingPlayer[][] = [
    ...Array.from(squadGroups.values()),
    ...chunkSolosIntoTempSquads(solos),
  ];

  let currentSub: MatchmakingPlayer[] = [];
  let labelIndex = 0;

  for (const unit of units) {
    if (currentSub.length + unit.length > SUB_SESSION_MAX_PLAYERS) {
      if (currentSub.length > 0) {
        subSessions.push({
          label: String.fromCharCode(65 + labelIndex),
          players: currentSub,
        });
        labelIndex++;
        currentSub = [];
      }
    }
    currentSub.push(...unit);
  }

  if (currentSub.length > 0) {
    subSessions.push({
      label: String.fromCharCode(65 + labelIndex),
      players: currentSub,
    });
  }

  return subSessions;
}

function chunkSolosIntoTempSquads(solos: MatchmakingPlayer[]): MatchmakingPlayer[][] {
  const squads: MatchmakingPlayer[][] = [];
  for (let i = 0; i < solos.length; i += 5) {
    squads.push(solos.slice(i, i + 5));
  }
  return squads;
}
