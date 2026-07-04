"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Globe, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "HOME", icon: Home },
  { href: "/sessions", label: "SESSIONS", icon: Calendar },
  { href: "/world", label: "WORLD", icon: Globe },
  { href: "/squads", label: "SQUAD", icon: Users },
  { href: "/profile", label: "PROFILE", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-phantom-bg border-t border-phantom-border py-3 px-4 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || 
            (item.href === "/home" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-phantom-purple" : "text-phantom-muted"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] uppercase font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
