"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/sessions", label: "Sessions" },
  { href: "/squads", label: "Squads" },
  { href: "/camps", label: "Camps" },
  { href: "/shop", label: "Shop" },
  { href: "/profile", label: "Profile" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-phantom-border bg-phantom-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "text-phantom-gold"
                : "text-phantom-muted hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
