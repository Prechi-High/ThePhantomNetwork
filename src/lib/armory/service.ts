import { createAdminClient } from "@/lib/supabase/admin";
import { TACTICAL_ASSET_SLUGS, normalizeAssetSlug } from "./tactical-assets";
import type { TacticalAssetSlug } from "@/types/gameplay";

export interface InventoryEntry {
  assetSlug: TacticalAssetSlug;
  quantity: number;
}

export interface LoadoutItem {
  assetSlug: TacticalAssetSlug;
  quantity: number;
}

export interface Loadout {
  id: string;
  name: string;
  isActive: boolean;
  items: LoadoutItem[];
}

export async function getLegacyCredits(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("legacy_credits")
    .eq("id", userId)
    .single();
  return data?.legacy_credits ?? 0;
}

export async function getTacticalInventory(userId: string): Promise<InventoryEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("player_tactical_inventory")
    .select("asset_slug, quantity")
    .eq("user_id", userId);

  const map = new Map<TacticalAssetSlug, number>();
  for (const slug of TACTICAL_ASSET_SLUGS) map.set(slug, 0);
  for (const row of data ?? []) {
    const slug = normalizeAssetSlug(row.asset_slug);
    if (slug) map.set(slug, row.quantity);
  }
  return TACTICAL_ASSET_SLUGS.map((slug) => ({ assetSlug: slug, quantity: map.get(slug) ?? 0 }));
}

export async function addToInventory(
  userId: string,
  assetSlug: TacticalAssetSlug,
  quantity: number
): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("player_tactical_inventory")
    .select("quantity")
    .eq("user_id", userId)
    .eq("asset_slug", assetSlug)
    .single();

  if (existing) {
    await admin
      .from("player_tactical_inventory")
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("asset_slug", assetSlug);
  } else {
    await admin.from("player_tactical_inventory").insert({
      user_id: userId,
      asset_slug: assetSlug,
      quantity,
    });
  }
}

export async function deductLegacyCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<number> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("legacy_credits")
    .eq("id", userId)
    .single();

  const current = profile?.legacy_credits ?? 0;
  if (current < amount) throw new Error("Insufficient Legacy Credits");

  const balanceAfter = current - amount;
  await admin.from("profiles").update({ legacy_credits: balanceAfter }).eq("id", userId);
  await admin.from("legacy_credit_transactions").insert({
    user_id: userId,
    amount: -amount,
    balance_after: balanceAfter,
    reason,
  });
  return balanceAfter;
}

export async function getUserLoadouts(userId: string): Promise<Loadout[]> {
  const admin = createAdminClient();
  const { data: loadouts } = await admin
    .from("player_loadouts")
    .select("id, name, is_active")
    .eq("user_id", userId)
    .order("created_at");

  if (!loadouts?.length) {
    const { data: created } = await admin
      .from("player_loadouts")
      .insert({ user_id: userId, name: "Default", is_active: true })
      .select("id, name, is_active")
      .single();
    if (created) loadouts.push(created);
  }

  const result: Loadout[] = [];
  for (const lo of loadouts ?? []) {
    const { data: items } = await admin
      .from("loadout_items")
      .select("asset_slug, quantity")
      .eq("loadout_id", lo.id);
    result.push({
      id: lo.id,
      name: lo.name,
      isActive: lo.is_active,
      items: (items ?? [])
        .map((i) => {
          const slug = normalizeAssetSlug(i.asset_slug);
          return slug ? { assetSlug: slug, quantity: i.quantity } : null;
        })
        .filter(Boolean) as LoadoutItem[],
    });
  }
  return result;
}

export async function getActiveLoadout(userId: string): Promise<Loadout | null> {
  const loadouts = await getUserLoadouts(userId);
  return loadouts.find((l) => l.isActive) ?? loadouts[0] ?? null;
}

export async function saveLoadoutItems(
  userId: string,
  loadoutId: string,
  items: LoadoutItem[]
): Promise<void> {
  const admin = createAdminClient();
  const { data: loadout } = await admin
    .from("player_loadouts")
    .select("id")
    .eq("id", loadoutId)
    .eq("user_id", userId)
    .single();
  if (!loadout) throw new Error("Loadout not found");

  const inventory = await getTacticalInventory(userId);
  const invMap = new Map(inventory.map((i) => [i.assetSlug, i.quantity]));
  for (const item of items) {
    if (item.quantity > (invMap.get(item.assetSlug) ?? 0)) {
      throw new Error(`Insufficient ${item.assetSlug} in inventory`);
    }
  }

  await admin.from("loadout_items").delete().eq("loadout_id", loadoutId);
  if (items.length > 0) {
    await admin.from("loadout_items").insert(
      items.map((i) => ({
        loadout_id: loadoutId,
        asset_slug: i.assetSlug,
        quantity: i.quantity,
      }))
    );
  }
}

export async function activateLoadout(userId: string, loadoutId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("player_loadouts").update({ is_active: false }).eq("user_id", userId);
  await admin
    .from("player_loadouts")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", loadoutId)
    .eq("user_id", userId);
}

/** Copy active loadout into session runtime state at join */
export async function applyLoadoutToSession(
  userId: string,
  sessionId: string
): Promise<LoadoutItem[]> {
  const loadout = await getActiveLoadout(userId);
  if (!loadout || loadout.items.length === 0) {
    throw new Error("No active loadout. Prepare in the Armory first.");
  }

  const admin = createAdminClient();
  for (const item of loadout.items) {
    await admin.from("session_loadout_state").upsert(
      {
        user_id: userId,
        session_id: sessionId,
        asset_slug: item.assetSlug,
        equipped_quantity: item.quantity,
        used_quantity: 0,
      },
      { onConflict: "user_id,session_id,asset_slug" }
    );
  }
  return loadout.items;
}

/** Apply loadout quantities to sub_session_players at session start */
export async function applySessionLoadoutsAtStart(sessionId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: states } = await admin
    .from("session_loadout_state")
    .select("*")
    .eq("session_id", sessionId);

  const { data: subSessions } = await admin
    .from("sub_sessions")
    .select("id")
    .eq("session_id", sessionId);

  for (const state of states ?? []) {
    for (const sub of subSessions ?? []) {
      const { data: player } = await admin
        .from("sub_session_players")
        .select("id")
        .eq("sub_session_id", sub.id)
        .eq("user_id", state.user_id)
        .single();
      if (!player) continue;

      const remaining = state.equipped_quantity - state.used_quantity;
      if (state.asset_slug === "guardian") {
        await admin
          .from("sub_session_players")
          .update({ shield_count: remaining })
          .eq("id", player.id);
      }
    }
  }
}

/** Deduct used assets from persistent inventory after session ends */
export async function settleSessionLoadouts(sessionId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: states } = await admin
    .from("session_loadout_state")
    .select("*")
    .eq("session_id", sessionId);

  for (const state of states ?? []) {
    if (state.used_quantity <= 0) continue;
    const { data: inv } = await admin
      .from("player_tactical_inventory")
      .select("quantity")
      .eq("user_id", state.user_id)
      .eq("asset_slug", state.asset_slug)
      .single();
    if (inv) {
      await admin
        .from("player_tactical_inventory")
        .update({
          quantity: Math.max(0, inv.quantity - state.used_quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", state.user_id)
        .eq("asset_slug", state.asset_slug);
    }
  }
}

export async function consumeSessionAsset(
  userId: string,
  sessionId: string,
  assetSlug: TacticalAssetSlug
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: state } = await admin
    .from("session_loadout_state")
    .select("*")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .eq("asset_slug", assetSlug)
    .single();

  if (!state) return false;
  const remaining = state.equipped_quantity - state.used_quantity;
  if (remaining <= 0) return false;

  await admin
    .from("session_loadout_state")
    .update({ used_quantity: state.used_quantity + 1 })
    .eq("id", state.id);
  return true;
}

export async function getSessionLoadoutSkills(
  userId: string,
  sessionId: string
): Promise<LoadoutItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("session_loadout_state")
    .select("asset_slug, equipped_quantity, used_quantity")
    .eq("user_id", userId)
    .eq("session_id", sessionId);

  return (data ?? [])
    .map((row) => {
      const slug = normalizeAssetSlug(row.asset_slug);
      if (!slug) return null;
      return {
        assetSlug: slug,
        quantity: row.equipped_quantity - row.used_quantity,
      };
    })
    .filter(Boolean) as LoadoutItem[];
}
