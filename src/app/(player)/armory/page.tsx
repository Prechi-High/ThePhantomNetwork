"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BottomNav from "@/components/ui/BottomNav";
import { useArmoryStore } from "@/stores/useArmoryStore";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import { CURRENCY, MESSAGES } from "@/lib/brand/terminology";
import type { TacticalAssetSlug } from "@/types/gameplay";

export default function ArmoryPage() {
  const {
    legacyCredits,
    inventory,
    loadouts,
    shopItems,
    setLegacyCredits,
    setInventory,
    setLoadouts,
    setShopItems,
  } = useArmoryStore();

  const [activeLoadoutId, setActiveLoadoutId] = useState<string | null>(null);
  const [loadoutDraft, setLoadoutDraft] = useState<Record<string, number>>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"purchase" | "inventory" | "loadout">("purchase");

  const refresh = useCallback(async () => {
    const [invRes, shopRes, loadRes] = await Promise.all([
      fetch("/api/armory/inventory").then((r) => r.json()),
      fetch("/api/armory/purchase").then((r) => r.json()),
      fetch("/api/armory/loadouts").then((r) => r.json()),
    ]);
    setLegacyCredits(invRes.legacyCredits ?? shopRes.legacyCredits ?? 0);
    setInventory(invRes.inventory ?? []);
    setShopItems(shopRes.items ?? []);
    setLoadouts(loadRes.loadouts ?? []);
    const active = (loadRes.loadouts ?? []).find((l: { isActive: boolean }) => l.isActive);
    if (active) {
      setActiveLoadoutId(active.id);
      const draft: Record<string, number> = {};
      for (const item of active.items) draft[item.assetSlug] = item.quantity;
      setLoadoutDraft(draft);
    }
  }, [setLegacyCredits, setInventory, setLoadouts, setShopItems]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    await fetch("/api/armory/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: 1 }),
    });
    await refresh();
    setPurchasing(null);
  };

  const handleSaveLoadout = async () => {
    if (!activeLoadoutId) return;
    setSaving(true);
    const items = Object.entries(loadoutDraft)
      .filter(([, qty]) => qty > 0)
      .map(([assetSlug, quantity]) => ({ assetSlug, quantity }));
    await fetch("/api/armory/loadouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", loadoutId: activeLoadoutId, items }),
    });
    await refresh();
    setSaving(false);
  };

  const invMap = new Map(inventory.map((i) => [i.assetSlug, i.quantity]));

  return (
    <div className="min-h-screen bg-phantom-bg pb-24">
      <div className="container-responsive space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{MESSAGES.armory}</h1>
            <p className="text-sm text-phantom-muted">{MESSAGES.prepareForBattle}</p>
          </div>
          <Badge variant="purple">{legacyCredits} {CURRENCY.legacy}</Badge>
        </div>

        <div className="flex gap-2">
          {(["purchase", "inventory", "loadout"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? "primary" : "ghost"}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {tab === "purchase" && (
          <div className="space-y-3">
            {shopItems.map((item) => (
              <Card key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-phantom-muted">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  disabled={purchasing === item.id || legacyCredits < item.price}
                  onClick={() => handlePurchase(item.id)}
                >
                  {item.price} {CURRENCY.legacy}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {tab === "inventory" && (
          <div className="space-y-2">
            {(Object.keys(TACTICAL_ASSET_DEFS) as TacticalAssetSlug[]).map((slug) => (
              <Card key={slug} className="flex justify-between">
                <span>{TACTICAL_ASSET_DEFS[slug].displayName}</span>
                <span className="font-bold">×{invMap.get(slug) ?? 0}</span>
              </Card>
            ))}
          </div>
        )}

        {tab === "loadout" && (
          <div className="space-y-4">
            <p className="text-sm text-phantom-muted">
              Equip tactical assets for your next session. Unused assets return after the session.
            </p>
            {(Object.keys(TACTICAL_ASSET_DEFS) as TacticalAssetSlug[]).map((slug) => {
              const owned = invMap.get(slug) ?? 0;
              const equipped = loadoutDraft[slug] ?? 0;
              return (
                <Card key={slug} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{TACTICAL_ASSET_DEFS[slug].displayName}</p>
                    <p className="text-xs text-phantom-muted">Owned: {owned}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={equipped <= 0}
                      onClick={() =>
                        setLoadoutDraft((d) => ({ ...d, [slug]: Math.max(0, (d[slug] ?? 0) - 1) }))
                      }
                    >
                      −
                    </Button>
                    <span className="w-6 text-center font-bold">{equipped}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={equipped >= owned}
                      onClick={() =>
                        setLoadoutDraft((d) => ({ ...d, [slug]: Math.min(owned, (d[slug] ?? 0) + 1) }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </Card>
              );
            })}
            <Button onClick={handleSaveLoadout} disabled={saving}>
              {saving ? "Saving..." : "Save Loadout"}
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
