"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/camp-owner", label: "Dashboard", exact: true },
  { href: "/camp-owner/members", label: "Members" },
  { href: "/camp-owner/squads", label: "Squads" },
  { href: "/camp-owner/revenue", label: "Revenue" },
  { href: "/camp-owner/recruit", label: "Recruit" },
];

export function CampOwnerNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-phantom-border bg-phantom-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <Link href="/camp-owner" className="font-display text-lg font-bold text-phantom-gold">
            Camp Owner
          </Link>
          <p className="text-xs text-phantom-muted">Community command center</p>
        </div>
        <nav className="flex flex-wrap gap-1">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-phantom-gold/15 text-phantom-gold"
                    : "text-phantom-muted hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/home" className="text-sm text-phantom-muted hover:text-phantom-gold">
          ← Player app
        </Link>
      </div>
    </header>
  );
}
