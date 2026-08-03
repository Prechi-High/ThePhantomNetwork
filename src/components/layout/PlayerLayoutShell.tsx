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
  if (pathname.startsWith("/legacy")) return "profile";
  if (pathname.startsWith("/creator")) return "profile";
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
  const isImmersive =
    isGameplay ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/tutorial");
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

  if (isImmersive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-legacy-bg pt-10" ref={contentRef}>
      {children}
    </div>
  );
}
