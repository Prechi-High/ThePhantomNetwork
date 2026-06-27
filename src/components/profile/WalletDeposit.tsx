"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setLoading(false);

    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      return;
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-phantom-danger">{error}</p>}
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

interface WalletDepositProps {
  onSuccess?: () => void;
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleDeposit = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents < 100) {
      setMessage("Minimum deposit is $1.00");
      return;
    }

    setLoading(true);
    setMessage("");
    setClientSecret(null);

    if (!stripePromise) {
      const adminRes = await fetch("/api/wallet/dev-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ amountCents: cents }),
      });
      if (adminRes.ok) {
        setMessage("Dev credit added!");
        onSuccess?.();
      } else {
        setMessage("Configure Stripe keys in Vercel or use dev mode locally");
      }
      setLoading(false);
      return;
    }

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ amountCents: cents }),
    });
    const data = await res.json();

    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
    } else {
      setMessage(data.error ?? "Deposit failed");
    }
    setLoading(false);
  };

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium">Add Funds</p>
      {!clientSecret ? (
        <>
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
              {loading ? "..." : "Continue"}
            </Button>
          </div>
          {message && <p className="text-xs text-phantom-muted">{message}</p>}
        </>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onSuccess={() => {
              setClientSecret(null);
              setMessage("Payment successful! Balance updating...");
              onSuccess?.();
            }}
          />
        </Elements>
      )}
    </Card>
  );
}
