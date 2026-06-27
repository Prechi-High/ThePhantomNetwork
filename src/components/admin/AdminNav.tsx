"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/camps", label: "Camps" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-phantom-border bg-phantom-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <Link href="/admin" className="font-display text-lg font-bold text-phantom-gold">
            Admin
          </Link>
          <p className="text-xs text-phantom-muted">THE PHANTOM Control</p>
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
