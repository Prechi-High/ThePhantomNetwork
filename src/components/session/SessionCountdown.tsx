"use client";

import { useEffect, useState } from "react";
import { formatCountdownHms } from "@/lib/gameplay/phase-timing";

interface SessionCountdownProps {
  startsAt?: string;
  status?: string;
  className?: string;
}

export function SessionCountdown({
  startsAt,
  status,
  className = "",
}: SessionCountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!startsAt) return null;

  const startMs = new Date(startsAt).getTime();
  if (Number.isNaN(startMs)) return null;

  const remaining = startMs - now;

  if (status === "completed") {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xs uppercase tracking-wider text-phantom-muted">Session</p>
        <p className="font-mono text-lg font-bold text-phantom-muted">Completed</p>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xs uppercase tracking-wider text-phantom-gold">Session in progress</p>
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xs uppercase tracking-wider text-phantom-gold">Starting now</p>
        <p className="font-mono text-xl font-bold text-phantom-gold">0h 0m 0s</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-xs uppercase tracking-wider text-phantom-muted">Session starts in</p>
      <p className="font-mono text-xl font-bold text-phantom-gold sm:text-2xl">
        {formatCountdownHms(remaining)}
      </p>
    </div>
  );
}
