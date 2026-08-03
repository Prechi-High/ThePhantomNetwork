"use client";

import { usePathname } from "next/navigation";

/** Global floating indicators — Master Screen Architecture Part 13 */
export function GlobalFloatingBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/play/")) return null;

  return (
    <div className="pointer-events-none fixed top-3 left-0 right-0 z-40 flex justify-center gap-2 px-4">
      <div className="rounded-full border border-legacy-border bg-legacy-card/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-legacy-emerald backdrop-blur-sm">
        Live
      </div>
    </div>
  );
}
