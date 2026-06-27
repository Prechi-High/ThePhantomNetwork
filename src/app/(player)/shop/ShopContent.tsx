"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useShopStore } from "@/stores/useShopStore";

export default function ShopContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { items, setItems, isLocked } = useShopStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, [setItems]);

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, sessionId }),
    });
    setPurchasing(null);
  };

  const grouped = {
    session_cash: items.filter((i) => i.economy === "session_cash"),
    squad_tokens: items.filter((i) => i.economy === "squad_tokens"),
    prestige_cash: items.filter((i) => i.economy === "prestige_cash"),
  };

  return (
    <div className="space-y-6">
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
