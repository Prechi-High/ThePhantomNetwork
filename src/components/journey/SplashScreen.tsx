"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand/terminology";

interface SplashScreenProps {
  nextHref: string;
  durationMs?: number;
}

export function SplashScreen({ nextHref, durationMs = 1600 }: SplashScreenProps) {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeT = setTimeout(() => setFade(true), durationMs - 280);
    const t = setTimeout(() => {
      const welcomeSeen =
        typeof window !== "undefined" && localStorage.getItem("legacies_welcome_seen") === "1";
      const tutorialDone =
        typeof window !== "undefined" && localStorage.getItem("legacies_tutorial_complete") === "1";
      if (nextHref === "/home" && !welcomeSeen) {
        router.replace("/welcome");
      } else if (nextHref === "/home" && welcomeSeen && !tutorialDone) {
        router.replace("/tutorial");
      } else {
        router.replace(nextHref);
      }
    }, durationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeT);
    };
  }, [nextHref, durationMs, router]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-legacy-bg transition-opacity duration-300 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(245,185,66,0.2) 0%, transparent 50%)",
        }}
      />
      <h1 className="relative font-display text-5xl font-bold tracking-tight text-legacy-gold">
        {APP_NAME}
      </h1>
      <p className="relative mt-4 max-w-xs text-center text-sm text-legacy-muted">{APP_TAGLINE}</p>
    </div>
  );
}
