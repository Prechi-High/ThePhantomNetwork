import { redisPublish } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

export async function publishPhaseChange(
  subSessionId: string,
  payload: {
    phase: number;
    round: number;
    phaseEndsAt: number;
    phaseStartedAt: number;
  }
) {
  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "phase_change",
    ...payload,
  });
}

export async function publishSessionStatus(sessionId: string, status: string) {
  await redisPublish(`session:${sessionId}:updates`, {
    type: "session_status",
    sessionId,
    status,
    at: Date.now(),
  });
}

export async function publishSubSessionComplete(subSessionId: string) {
  await redisPublish(redisKeys.realtimeChannel(subSessionId), {
    type: "session_complete",
    subSessionId,
    at: Date.now(),
  });
}
