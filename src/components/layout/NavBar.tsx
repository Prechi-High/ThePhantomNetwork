"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
            className="px-3 py-2 text-xs font-medium transition-colors"
          >
            <span className={cn(
              pathname.startsWith(item.href)
                ? "text-phantom-gold"
                : "text-phantom-muted hover:text-white"
            )}>
              {item.label}
            </span>
            {pathname.startsWith(item.href) && (
              <motion.div
                layoutId="nav-indicator"
                className="h-1 bg-phantom-gold rounded-full mt-1"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
