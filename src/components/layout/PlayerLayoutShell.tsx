"use client";

import { usePathname } from "next/navigation";

export function PlayerLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGameplay = pathname.startsWith("/play/");

  if (isGameplay) {
    // Gameplay occupies 100dvh with its own fixed root — no wrapper chrome
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {children}
      </main>
    </div>
  );
}
