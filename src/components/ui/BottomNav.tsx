"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Globe, Video, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navTabs } from "@/lib/design/tokens";

const icons = [Home, Calendar, Globe, Video, Crown];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/play/")) return null;
  if (pathname.startsWith("/welcome") || pathname.startsWith("/tutorial")) return null;

  return (
    <nav data-bottom-nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-legacy-border bg-legacy-bg/95 py-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-2">
        {navTabs.map((item, i) => {
          const Icon = icons[i];
          const isActive = pathname.startsWith(item.href) || (item.href === "/home" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 transition-colors",
                isActive ? "text-legacy-gold" : "text-legacy-muted hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
