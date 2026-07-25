import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import {
  getLegacyCredits,
  getTacticalInventory,
  getUserLoadouts,
} from "@/lib/armory/service";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const [legacyCredits, inventory, loadouts] = await Promise.all([
    getLegacyCredits(user!.id),
    getTacticalInventory(user!.id),
    getUserLoadouts(user!.id),
  ]);

  return NextResponse.json({
    legacyCredits,
    inventory: inventory.map((i) => ({
      assetSlug: i.assetSlug,
      quantity: i.quantity,
    })),
    loadouts,
  });
}
