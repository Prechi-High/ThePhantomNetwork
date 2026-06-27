"use client";

import { useEffect, useState } from "react";

interface PhaseTimerProps {
  endsAt: number;
  label?: string;
}

export function PhaseTimer({ endsAt, label }: PhaseTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="text-center">
      {label && <p className="text-xs text-phantom-muted">{label}</p>}
      <p className="font-mono text-2xl font-bold text-phantom-gold">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
    </div>
  );
}
