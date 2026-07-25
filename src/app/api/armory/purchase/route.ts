import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addToInventory,
  deductLegacyCredits,
  getLegacyCredits,
  getTacticalInventory,
} from "@/lib/armory/service";
import { normalizeAssetSlug } from "@/lib/armory/tactical-assets";
import type { TacticalAssetSlug } from "@/types/gameplay";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { itemId, quantity = 1 } = await request.json();
  const admin = createAdminClient();

  const { data: item } = await admin
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (!item || item.economy !== "legacy_credits") {
    return NextResponse.json({ error: "Invalid armory item" }, { status: 400 });
  }

  const meta = item.metadata as { asset_slug?: string };
  const assetSlug = normalizeAssetSlug(meta?.asset_slug ?? item.slug);
  if (!assetSlug) {
    return NextResponse.json({ error: "Unknown tactical asset" }, { status: 400 });
  }

  const unitPrice = item.price_cents ?? 0;
  const totalCost = unitPrice * quantity;

  try {
    const balanceAfter = await deductLegacyCredits(
      user!.id,
      totalCost,
      `armory_purchase:${assetSlug}`
    );
    await addToInventory(user!.id, assetSlug as TacticalAssetSlug, quantity);

    await admin.from("shop_purchases").insert({
      user_id: user!.id,
      shop_item_id: itemId,
      amount_paid_cents: totalCost,
    });

    const inventory = await getTacticalInventory(user!.id);
    return NextResponse.json({
      success: true,
      legacyCredits: balanceAfter,
      inventory: inventory.map((i) => ({ assetSlug: i.assetSlug, quantity: i.quantity })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Purchase failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const admin = createAdminClient();
  const { data: items } = await admin
    .from("shop_items")
    .select("*")
    .eq("economy", "legacy_credits")
    .eq("is_active", true);

  const legacyCredits = await getLegacyCredits(user!.id);

  return NextResponse.json({
    legacyCredits,
    items: (items ?? []).map((i) => {
      const meta = i.metadata as { asset_slug?: string };
      return {
        id: i.id,
        slug: i.slug,
        name: i.name,
        description: i.description,
        price: i.price_cents ?? 0,
        assetSlug: normalizeAssetSlug(meta?.asset_slug ?? i.slug),
      };
    }),
  });
}
