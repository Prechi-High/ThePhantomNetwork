import { createAdminClient } from "@/lib/supabase/admin";
import {
  applyLoadoutToSession,
  getActiveLoadout,
} from "@/lib/armory/service";
import { createSubSessions } from "@/lib/gameplay/matchmaking";
import { initBotsInSubSession } from "@/lib/gameplay/ai-players";
import {
  applyInventoryAtSessionStart,
  initializeSubSessionState,
} from "@/lib/gameplay/session-orchestrator";
import { publishSessionStatus } from "@/lib/gameplay/realtime-events";
import type { PhaseConfig } from "@/types/gameplay";

export interface CreatePracticeInput {
  userId: string;
  title: string;
  botCount: number;
  phaseConfig: PhaseConfig;
}

export interface PracticeSessionResult {
  sessionId: string;
  subSessionId: string;
  playUrl: string;
}

function validatePhaseConfig(phaseConfig: PhaseConfig): void {
  if (!Array.isArray(phaseConfig) || phaseConfig.length === 0) {
    throw new Error("At least one phase is required");
  }
  for (const phase of phaseConfig) {
    if (!phase.duration_minutes || phase.duration_minutes < 1) {
      throw new Error(`Phase ${phase.phase} must have a positive duration`);
    }
    if (!["target", "percentage", "none"].includes(phase.elimination_rule)) {
      throw new Error(`Invalid elimination rule on phase ${phase.phase}`);
    }
  }
}

export async function createAndStartPracticeSession(
  input: CreatePracticeInput
): Promise<PracticeSessionResult> {
  validatePhaseConfig(input.phaseConfig);

  const loadout = await getActiveLoadout(input.userId);
  if (!loadout || loadout.items.length === 0) {
    throw new Error("No active loadout. Prepare in the Armory first.");
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: session, error: createErr } = await admin
    .from("sessions")
    .insert({
      title: input.title,
      status: "open",
      session_mode: "solo",
      session_type: "ai_practice",
      created_by: input.userId,
      entry_fee_cents: 0,
      max_players: 1,
      registered_count: 1,
      total_pool_cents: 0,
      starts_at: now.toISOString(),
      registration_closes_at: now.toISOString(),
      phase_config: input.phaseConfig,
      economy_config: { ai_bot_count: input.botCount },
    })
    .select("id")
    .single();

  if (createErr || !session) {
    throw new Error(createErr?.message ?? "Failed to create practice session");
  }

  const sessionId = session.id;

  await applyLoadoutToSession(input.userId, sessionId);

  await admin.from("session_registrations").insert({
    session_id: sessionId,
    user_id: input.userId,
    squad_id: null,
    entry_paid_cents: 0,
  });

  await admin.from("sessions").update({ status: "locked" }).eq("id", sessionId);
  await publishSessionStatus(sessionId, "locked");

  const assignments = createSubSessions(
    [{ userId: input.userId, isPermanentSquad: false }],
    "solo"
  );

  const assignment = assignments[0];
  if (!assignment) {
    throw new Error("Failed to assign sub-session");
  }

  const { data: subSession, error: subErr } = await admin
    .from("sub_sessions")
    .insert({
      session_id: sessionId,
      label: assignment.label,
      player_count: assignment.players.length,
      pool_cents: 0,
      status: "pending",
    })
    .select("id")
    .single();

  if (subErr || !subSession) {
    throw new Error(subErr?.message ?? "Failed to create sub-session");
  }

  const subSessionId = subSession.id;

  for (const player of assignment.players) {
    await admin.from("sub_session_players").insert({
      sub_session_id: subSessionId,
      user_id: player.userId,
      squad_id: null,
      is_temporary_squad: false,
      is_bot: false,
    });
  }

  await initBotsInSubSession(subSessionId, input.botCount);

  await admin.from("sessions").update({ status: "active" }).eq("id", sessionId);
  await publishSessionStatus(sessionId, "active");
  await applyInventoryAtSessionStart(sessionId);

  await admin
    .from("sub_sessions")
    .update({
      status: "active",
      current_phase: 1,
      phase_started_at: now.toISOString(),
    })
    .eq("id", subSessionId);

  await admin
    .from("sub_session_players")
    .update({
      session_tokens: 0,
      is_eliminated: false,
      is_revivable: false,
      elimination_phase: null,
      final_tokens: null,
      final_rank: null,
    })
    .eq("sub_session_id", subSessionId);

  await initializeSubSessionState(subSessionId, input.phaseConfig);

  return {
    sessionId,
    subSessionId,
    playUrl: `/play/${sessionId}`,
  };
}
