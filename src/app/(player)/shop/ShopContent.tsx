"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useShopStore } from "@/stores/useShopStore";
import { ScreenAmbience } from "@/components/motion/ScreenAmbience";
import { appEvents } from "@/lib/motion/appEvents";
import { economyNetwork, sessionNetwork } from "@/lib/network";

export default function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { items, setItems, isLocked, setLocked } = useShopStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    economyNetwork.getShop().then((result) => {
      if (result.ok) {
        const d = result.data as { items?: typeof items };
        setItems(d.items ?? []);
      }
    });
  }, [setItems]);

  useEffect(() => {
    if (!sessionId) return;
    sessionNetwork.getSession(sessionId).then((result) => {
      if (result.ok) {
        const d = result.data as { session?: { status?: string } };
        const status = d.session?.status;
        if (status === "active" || status === "locked") {
          setLocked(true);
          router.replace("/sessions");
        }
      }
    }).catch(() => {});
  }, [sessionId, router, setLocked]);

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    await economyNetwork.purchaseShop(itemId, { sessionId });
    appEvents.emit({ type: "PURCHASE_COMPLETE", timestamp: Date.now(), source: "player" });
    setPurchasing(null);
  };

  const grouped = {
    session_cash: items.filter((i) => i.economy === "session_cash"),
    squad_tokens: items.filter((i) => i.economy === "squad_tokens"),
    prestige_cash: items.filter((i) => i.economy === "prestige_cash"),
  };

  return (
    <div className="space-y-6 relative">
      <ScreenAmbience screen="shop" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Shop</h1>
        {isLocked && <Badge variant="danger">Locked</Badge>}
      </div>

      {!sessionId && (
        <Card>
          <p className="text-sm text-phantom-muted">
            Join a session first, then visit the shop from session details.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([economy, economyItems]) => (
        <section key={economy}>
          <h2 className="mb-3 text-sm font-semibold uppercase text-phantom-muted">
            {economy.replace("_", " ")}
          </h2>
          <div className="space-y-2">
            {economyItems.map((item) => (
              <Card key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-phantom-muted">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  disabled={isLocked || purchasing === item.id || !sessionId}
                  onClick={() => handlePurchase(item.id)}
                >
                  {item.price_cents
                    ? `$${(item.price_cents / 100).toFixed(2)}`
                    : `${item.price_squad_tokens} tokens`}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
