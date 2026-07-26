"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { interactionController } from "@/lib/motion/InteractionController";
import { appEvents } from "@/lib/motion/appEvents";
import type { ScreenId } from "@/lib/motion/types";

function pathnameToScreen(pathname: string): ScreenId | null {
  if (pathname.startsWith("/play/")) return "play";
  if (pathname.startsWith("/home") || pathname === "/") return "home";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/camps")) return "camp";
  if (pathname.startsWith("/squads")) return "squad";
  if (pathname.startsWith("/world")) return "leaderboard";
  if (pathname.includes("/results")) return "results";
  return null;
}

export function PlayerLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGameplay = pathname.startsWith("/play/");
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const prevScreenRef = useRef<ScreenId | null>(null);

  useEffect(() => {
    const screen = pathnameToScreen(pathname);
    const prevScreen = prevScreenRef.current;

    if (prevPathRef.current !== pathname && contentRef.current) {
      interactionController.transitionScreen(null, contentRef.current, "fade");
    }

    if (screen && screen !== prevScreen) {
      if (prevScreen) {
        appEvents.emit({
          type: "SCREEN_EXIT",
          timestamp: Date.now(),
          payload: { screen: prevScreen },
          source: "system",
        });
      }
      interactionController.setScreen(screen);
      prevScreenRef.current = screen;
    }

    prevPathRef.current = pathname;
  }, [pathname]);

  if (isGameplay) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-24">
      <main
        ref={contentRef}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8"
      >
        {children}
      </main>
    </div>
  );
}
