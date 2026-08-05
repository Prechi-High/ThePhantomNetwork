"use client";

import Link from "next/link";

export function HomeSpinWidget() {
  const segments = ["XP", "Tokens", "Boost", "XP", "Tokens", "Boost"];

  return (
    <Link
      href="/sessions"
      className="flex h-full flex-col rounded-xl border border-purple-500/30 bg-black/60 p-3"
    >
      <p className="text-[9px] font-bold uppercase text-purple-400">Strategy Wheel</p>
      <p className="mb-2 text-[9px] text-white/40">Next free spin</p>
      <p className="mb-2 font-mono text-sm font-bold text-white">00:42:18</p>
      <div className="relative mx-auto my-1 h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {segments.map((_, i) => {
            const angle = (360 / segments.length) * i;
            return (
              <path
                key={i}
                d={`M50,50 L${50 + 40 * Math.cos(((angle - 90) * Math.PI) / 180)},${50 + 40 * Math.sin(((angle - 90) * Math.PI) / 180)} A40,40 0 0,1 ${50 + 40 * Math.cos(((angle - 90 + 360 / segments.length) * Math.PI) / 180)},${50 + 40 * Math.sin(((angle - 90 + 360 / segments.length) * Math.PI) / 180)} Z`}
                fill={i % 2 === 0 ? "rgba(124,58,237,0.4)" : "rgba(245,185,66,0.3)"}
                stroke="rgba(255,255,255,0.1)"
              />
            );
          })}
          <circle cx="50" cy="50" r="12" fill="#0B0F14" stroke="#f5b942" strokeWidth="1" />
          <text x="50" y="54" textAnchor="middle" fill="#f5b942" fontSize="7" fontWeight="bold">
            SPIN
          </text>
        </svg>
      </div>
    </Link>
  );
}
