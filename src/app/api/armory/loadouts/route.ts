import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import {
  activateLoadout,
  getUserLoadouts,
  saveLoadoutItems,
} from "@/lib/armory/service";
import type { TacticalAssetSlug } from "@/types/gameplay";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;
  const loadouts = await getUserLoadouts(user!.id);
  return NextResponse.json({ loadouts });
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { action, loadoutId, name, items } = body as {
    action: "create" | "save" | "activate";
    loadoutId?: string;
    name?: string;
    items?: { assetSlug: TacticalAssetSlug; quantity: number }[];
  };

  if (action === "save" && loadoutId && items) {
    try {
      await saveLoadoutItems(user!.id, loadoutId, items);
      const loadouts = await getUserLoadouts(user!.id);
      return NextResponse.json({ success: true, loadouts });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save loadout";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  if (action === "activate" && loadoutId) {
    await activateLoadout(user!.id, loadoutId);
    const loadouts = await getUserLoadouts(user!.id);
    return NextResponse.json({ success: true, loadouts });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
