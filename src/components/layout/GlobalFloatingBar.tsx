"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/** Global floating indicators — Master Screen Architecture Part 13 */
export function GlobalFloatingBar() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/play/") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/tutorial") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding")
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-3 left-0 right-0 z-40 flex justify-center gap-2 px-4">
      <div className="flex items-center gap-2 rounded-full border border-legacy-divider bg-legacy-card/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-legacy-emerald backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-legacy-emerald" />
        Live
      </div>
    </div>
  );
}
