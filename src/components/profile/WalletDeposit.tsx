"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface WalletDepositProps {
  onSuccess?: () => void;
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeposit = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents < 100) {
      setMessage("Minimum deposit is $1.00");
      return;
    }

    setLoading(true);
    setMessage("");

    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      const adminRes = await fetch("/api/wallet/dev-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: cents }),
      });
      if (adminRes.ok) {
        setMessage("Dev credit added!");
        onSuccess?.();
      } else {
        setMessage("Configure Stripe or use dev mode");
      }
      setLoading(false);
      return;
    }

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents: cents }),
    });
    const data = await res.json();
    if (data.clientSecret) {
      setMessage("Stripe PaymentIntent created — complete payment in Stripe UI");
    } else {
      setMessage(data.error ?? "Deposit failed");
    }
    setLoading(false);
  };

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium">Add Funds</p>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
          placeholder="Amount USD"
        />
        <Button onClick={handleDeposit} disabled={loading} size="sm">
          {loading ? "..." : "Deposit"}
        </Button>
      </div>
      {message && <p className="text-xs text-phantom-muted">{message}</p>}
    </Card>
  );
}
