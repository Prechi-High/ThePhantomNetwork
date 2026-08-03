"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand/terminology";

interface SplashScreenProps {
  nextHref: string;
  durationMs?: number;
}

export function SplashScreen({ nextHref, durationMs = 1500 }: SplashScreenProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      const welcomeSeen = typeof window !== "undefined" && localStorage.getItem("legacies_welcome_seen") === "1";
      const tutorialDone = typeof window !== "undefined" && localStorage.getItem("legacies_tutorial_complete") === "1";
      if (nextHref === "/home" && !welcomeSeen) {
        router.replace("/welcome");
      } else if (nextHref === "/home" && welcomeSeen && !tutorialDone) {
        router.replace("/tutorial");
      } else {
        router.replace(nextHref);
      }
    }, durationMs);
    return () => clearTimeout(t);
  }, [nextHref, durationMs, router]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-legacy-bg">
      <h1 className="font-display text-4xl font-bold tracking-tight text-legacy-gold">{APP_NAME}</h1>
      <p className="mt-3 max-w-xs text-center text-sm text-legacy-muted">{APP_TAGLINE}</p>
    </div>
  );
}
