import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { contributeToRevive, isReviveComplete } from "@/lib/gameplay/revive";
import { REVIVE_COST } from "@/types/gameplay";
import { redisGet, redisSet } from "@/lib/redis/client";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, targetUserId, amount } = await request.json();
  const admin = createAdminClient();

  const reviveKey = `revive:${subSessionId}:${targetUserId}`;
  let state = await redisGet<{
    targetUserId: string;
    required: number;
    contributed: number;
    contributors: { userId: string; amount: number }[];
  }>(reviveKey);

  if (!state) {
    state = {
      targetUserId,
      required: REVIVE_COST,
      contributed: 0,
      contributors: [],
    };
  }

  const { data: contributor } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .eq("user_id", user!.id)
    .single();

  if (!contributor || contributor.is_eliminated) {
    return NextResponse.json({ error: "Cannot contribute" }, { status: 400 });
  }

  if (Number(contributor.session_tokens) < amount) {
    return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 });
  }

  const newContributorTokens = Number(contributor.session_tokens) - amount;
  await admin
    .from("sub_session_players")
    .update({ session_tokens: newContributorTokens })
    .eq("id", contributor.id);

  state = contributeToRevive(state, user!.id, amount);
  await redisSet(reviveKey, state, 300);

  await admin.from("revives").insert({
    sub_session_id: subSessionId,
    revived_user_id: targetUserId,
    contributor_id: user!.id,
    tokens_contributed: amount,
  });

  if (isReviveComplete(state)) {
    await admin
      .from("sub_session_players")
      .update({ is_eliminated: false, is_revivable: false })
      .eq("sub_session_id", subSessionId)
      .eq("user_id", targetUserId);
  }

  return NextResponse.json({
    contributed: state.contributed,
    required: state.required,
    revived: isReviveComplete(state),
  });
}
