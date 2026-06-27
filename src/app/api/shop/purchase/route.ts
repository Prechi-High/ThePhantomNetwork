import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { itemId, sessionId, squadId } = await request.json();
  const admin = createAdminClient();

  const { data: item } = await admin
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (sessionId) {
    const { data: session } = await admin
      .from("sessions")
      .select("status")
      .eq("id", sessionId)
      .single();

    if (session?.status === "active" || session?.status === "locked") {
      return NextResponse.json({ error: "Shop locked during session" }, { status: 403 });
    }
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (item.economy === "session_cash" || item.economy === "prestige_cash") {
    if (profile.level < item.level_required) {
      return NextResponse.json({ error: "Level requirement not met" }, { status: 403 });
    }
    if (profile.wallet_balance_cents < (item.price_cents ?? 0)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const newBalance = profile.wallet_balance_cents - (item.price_cents ?? 0);
    await admin.from("profiles").update({ wallet_balance_cents: newBalance }).eq("id", user!.id);
    await admin.from("wallet_transactions").insert({
      user_id: user!.id,
      type: "shop_purchase",
      amount_cents: -(item.price_cents ?? 0),
      balance_after_cents: newBalance,
      reference_type: "shop_item",
      reference_id: itemId,
    });

    if (sessionId) {
      const inventoryField = getInventoryField(item.slug);
      if (inventoryField) {
        const { data: inv } = await admin
          .from("player_inventory")
          .select("*")
          .eq("user_id", user!.id)
          .eq("session_id", sessionId)
          .single();

        if (inv) {
          const updates: Record<string, unknown> = {};
          if (inventoryField.type === "count") {
            updates[inventoryField.field] = (inv[inventoryField.field as keyof typeof inv] as number) + 1;
          } else {
            updates[inventoryField.field] = true;
          }
          await admin.from("player_inventory").update(updates).eq("id", inv.id);
        } else {
          const insert: Record<string, unknown> = {
            user_id: user!.id,
            session_id: sessionId,
          };
          if (inventoryField.type === "count") {
            insert[inventoryField.field] = 1;
          } else {
            insert[inventoryField.field] = true;
          }
          await admin.from("player_inventory").insert(insert);
        }
      }
    }
  } else if (item.economy === "squad_tokens") {
    const { data: squad } = await admin
      .from("squads")
      .select("squad_tokens")
      .eq("id", squadId)
      .single();

    if (!squad || squad.squad_tokens < (item.price_squad_tokens ?? 0)) {
      return NextResponse.json({ error: "Insufficient squad tokens" }, { status: 400 });
    }

    await admin
      .from("squads")
      .update({ squad_tokens: squad.squad_tokens - (item.price_squad_tokens ?? 0) })
      .eq("id", squadId);
  }

  await admin.from("shop_purchases").insert({
    user_id: user!.id,
    shop_item_id: itemId,
    session_id: sessionId ?? null,
    squad_id: squadId ?? null,
    amount_paid_cents: item.price_cents,
    amount_paid_tokens: item.price_squad_tokens,
  });

  return NextResponse.json({ success: true });
}

function getInventoryField(slug: string): { field: string; type: "count" | "flag" } | null {
  const map: Record<string, { field: string; type: "count" | "flag" }> = {
    shield: { field: "shield_count", type: "count" },
    cloak: { field: "cloak_count", type: "count" },
    insurance: { field: "insurance_count", type: "count" },
    steal_boost: { field: "steal_boost_active", type: "flag" },
    shield_boost: { field: "shield_boost_active", type: "flag" },
  };
  return map[slug] ?? null;
}
