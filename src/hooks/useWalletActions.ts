"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { economyNetwork } from "@/lib/network";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export function useWalletActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const deposit = useCallback(async (amountDollars: string) => {
    const cents = Math.round(parseFloat(amountDollars) * 100);
    if (isNaN(cents) || cents < 100) {
      setMessage("Minimum deposit is $1.00");
      return;
    }

    setLoading(true);
    setMessage("");
    setClientSecret(null);

    if (!stripePromise) {
      const result = await economyNetwork.devCredit(cents);
      if (result.ok) {
        setMessage("Dev credit added!");
        onSuccess?.();
      } else {
        setMessage("Configure Stripe keys in Vercel or use dev mode locally");
      }
      setLoading(false);
      return;
    }

    const result = await economyNetwork.deposit(cents);
    if (result.ok && result.data.clientSecret) {
      setClientSecret(result.data.clientSecret);
    } else {
      setMessage("Could not start deposit");
    }
    setLoading(false);
  }, [onSuccess]);

  return {
    loading,
    message,
    clientSecret,
    stripePromise,
    deposit,
    setMessage,
  };
}
