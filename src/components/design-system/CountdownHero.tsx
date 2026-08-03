"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownHeroProps {
  targetDate: Date | string | number | null;
  className?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownHero({ targetDate, className }: CountdownHeroProps) {
  const [left, setLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const end = new Date(targetDate).getTime();
      const diff = Math.max(0, end - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setLeft({ h: pad(h), m: pad(m), s: pad(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <p className={cn("font-mono text-3xl font-bold text-legacy-muted", className)}>— : — : —</p>
    );
  }

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {[
        { v: left.h, l: "Hrs" },
        { v: left.m, l: "Min" },
        { v: left.s, l: "Sec" },
      ].map((u, i) => (
        <div key={u.l} className="flex items-center gap-3">
          {i > 0 && <span className="text-2xl font-bold text-legacy-gold">:</span>}
          <div className="flex flex-col items-center">
            <span className="font-mono text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {u.v}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-legacy-muted">
              {u.l}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
