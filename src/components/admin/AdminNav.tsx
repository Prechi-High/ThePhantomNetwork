"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/camps", label: "Camps" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/errors", label: "Errors" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/admin/login");
    router.refresh();
  };

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
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-sm text-phantom-muted hover:text-phantom-gold">
            Player app
          </Link>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
