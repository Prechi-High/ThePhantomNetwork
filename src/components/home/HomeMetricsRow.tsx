"use client";

import Link from "next/link";
import { ChevronRight, DollarSign, Hexagon, Star } from "lucide-react";

interface HomeMetricsRowProps {
  tokens?: number;
  influence?: number;
  earningsCents?: number;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function HomeMetricsRow({
  tokens = 0,
  influence = 0,
  earningsCents = 0,
}: HomeMetricsRowProps) {
  const items = [
    {
      icon: Hexagon,
      value: tokens.toLocaleString(),
      label: "Phantom Tokens",
      color: "text-purple-400",
      border: "border-purple-500/30",
      href: "/legacy",
    },
    {
      icon: Star,
      value: influence.toLocaleString(),
      label: "Influence",
      color: "text-[#f5b942]",
      border: "border-[#f5b942]/30",
      href: "/world",
    },
    {
      icon: DollarSign,
      value: formatMoney(earningsCents),
      label: "Earnings",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      href: "/profile",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ icon: Icon, value, label, color, border, href }) => (
        <Link
          key={label}
          href={href}
          className={`flex flex-col rounded-xl border ${border} bg-black/50 px-2 py-3`}
        >
          <div className="flex items-center justify-between">
            <Icon className={`h-4 w-4 ${color}`} />
            <ChevronRight className="h-3 w-3 text-white/20" />
          </div>
          <p className={`mt-1 text-sm font-bold tabular-nums ${color}`}>{value}</p>
          <p className="text-[8px] font-semibold uppercase text-white/40">{label}</p>
        </Link>
      ))}
    </div>
  );
}
