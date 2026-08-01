"use client";

import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWalletActions } from "@/hooks/useWalletActions";

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
  const { loading, message, clientSecret, stripePromise, deposit, setMessage } =
    useWalletActions(onSuccess);

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
            <Button onClick={() => deposit(amount)} disabled={loading} size="sm">
              {loading ? "..." : "Continue"}
            </Button>
          </div>
          {message && <p className="text-xs text-phantom-muted">{message}</p>}
        </>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onSuccess={() => {
              setMessage("Payment successful! Balance updating...");
              onSuccess?.();
            }}
          />
        </Elements>
      )}
    </Card>
  );
}
