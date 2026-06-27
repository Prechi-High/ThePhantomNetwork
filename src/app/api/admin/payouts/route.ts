import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateSessionEconomy } from "@/lib/gameplay/economy";
import type { EconomyConfig } from "@/types/gameplay";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subSessionId } = await request.json();
  const admin = createAdminClient();

  const { data: subSession } = await admin
    .from("sub_sessions")
    .select("*, sessions(*)")
    .eq("id", subSessionId)
    .single();

  if (!subSession) {
    return NextResponse.json({ error: "Sub-session not found" }, { status: 404 });
  }

  const session = subSession.sessions as {
    id: string;
    entry_fee_cents: number;
    platform_fee_pct: number;
    economy_config: EconomyConfig;
  };

  const { data: players } = await admin
    .from("sub_session_players")
    .select("*")
    .eq("sub_session_id", subSessionId)
    .order("session_tokens", { ascending: false });

  const ranked = (players ?? []).map((p, i) => ({
    userId: p.user_id,
    rank: i + 1,
    tokens: Number(p.session_tokens),
    squadId: p.squad_id ?? undefined,
    isPermanentSquad: !p.is_temporary_squad,
  }));

  const winner = ranked[0];
  let winnerSquadMembers: { userId: string; tokens: number }[] = [];

  if (winner?.squadId && winner.isPermanentSquad) {
    winnerSquadMembers = ranked
      .filter((p) => p.squadId === winner.squadId && p.userId !== winner.userId)
      .map((p) => ({ userId: p.userId, tokens: p.tokens }));
  }

  const economy = calculateSessionEconomy(
    ranked,
    session.entry_fee_cents,
    Number(session.platform_fee_pct),
    session.economy_config,
    winnerSquadMembers
  );

  for (const [userId, breakdown] of economy.payouts) {
    await admin.from("session_payouts").insert({
      session_id: session.id,
      sub_session_id: subSessionId,
      user_id: userId,
      rank: ranked.find((r) => r.userId === userId)?.rank ?? 0,
      breakdown,
      total_cents: breakdown.total,
    });

    const { data: profile } = await admin
      .from("profiles")
      .select("wallet_balance_cents")
      .eq("id", userId)
      .single();

    const newBalance = (profile?.wallet_balance_cents ?? 0) + breakdown.total;
    await admin.from("profiles").update({ wallet_balance_cents: newBalance }).eq("id", userId);
    await admin.from("wallet_transactions").insert({
      user_id: userId,
      type: breakdown.refund ? "refund" : "reward",
      amount_cents: breakdown.total,
      balance_after_cents: newBalance,
      reference_type: "sub_session",
      reference_id: subSessionId,
    });
  }

  if (winner) {
    await admin.from("sub_sessions").update({ winner_id: winner.userId, status: "completed" }).eq("id", subSessionId);
  }

  const permanentSquads = new Set(
    (players ?? []).filter((p) => !p.is_temporary_squad && p.squad_id).map((p) => p.squad_id)
  );

  for (const squadId of permanentSquads) {
    const { data: squad } = await admin
      .from("squads")
      .select("squad_tokens, history_sessions")
      .eq("id", squadId!)
      .single();
    if (squad) {
      await admin
        .from("squads")
        .update({
          squad_tokens: squad.squad_tokens + 100,
          history_sessions: squad.history_sessions + 1,
        })
        .eq("id", squadId!);
    }
  }

  return NextResponse.json({ success: true, reconciliation: economy.reconciliation });
}
