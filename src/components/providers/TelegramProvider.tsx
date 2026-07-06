"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TelegramSDK } from "@/lib/telegram/TelegramSDK";
import type { TelegramWebApp } from "@/lib/telegram/types";
import type { TelegramInitStatus } from "@/lib/telegram/TelegramSDK";

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  status: TelegramInitStatus;
  isLoading: boolean;
  isInTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [status, setStatus] = useState<TelegramInitStatus>({
    sdkLoaded: false,
    telegramDetected: false,
    initDataAvailable: false,
    timestamp: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sdk = TelegramSDK.getInstance();
    
    sdk.initialize({
      maxAttempts: 50,
      retryInterval: 100,
      timeout: 5000,
    }).then((app) => {
      setWebApp(app);
      setStatus(sdk.getStatus());
      setIsLoading(false);
    });
  }, []);

  const value: TelegramContextValue = {
    webApp,
    status,
    isLoading,
    isInTelegram: !!(webApp && webApp.initData),
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextValue {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}
