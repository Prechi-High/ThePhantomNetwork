"use client";

import { useEffect, useState } from "react";

interface SessionCountdownProps {
  /** ISO timestamp when registration closes (T-10min before start) */
  registrationClosesAt?: string;
  /** ISO timestamp when session starts */
  startsAt?: string;
  status?: string;
  className?: string;
  /** Show countdown any time before start (detail pages). Default: only final 10 minutes. */
  alwaysShow?: boolean;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SessionCountdown({
  registrationClosesAt,
  startsAt,
  status,
  className = "",
  alwaysShow = false,
}: SessionCountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!startsAt || status === "active" || status === "completed") return null;

  const startMs = new Date(startsAt).getTime();
  const regCloseMs = registrationClosesAt
    ? new Date(registrationClosesAt).getTime()
    : startMs - 10 * 60 * 1000;

  const toStart = startMs - now;
  const toRegClose = regCloseMs - now;
  const tenMinMs = 10 * 60 * 1000;

  // Only surface countdown within the final 10 minutes before start (or reg close window)
  const showCountdown =
    (toStart > 0 && toStart <= tenMinMs) ||
    (status === "open" && toRegClose > 0 && toRegClose <= tenMinMs);

  if (!showCountdown && toStart > tenMinMs && !alwaysShow) return null;

  if (toStart <= 0 && status === "locked") {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xs uppercase tracking-wider text-phantom-gold">Starting now</p>
        <p className="font-mono text-2xl font-bold text-phantom-gold">00:00</p>
      </div>
    );
  }

  if (toStart <= 0) return null;

  const inRegWindow = status === "open" && toRegClose > 0;
  const label = inRegWindow ? "Registration closes in" : "Session starts in";
  const remaining = inRegWindow ? toRegClose : toStart;

  return (
    <div className={`text-center ${className}`}>
      <p className="text-xs uppercase tracking-wider text-phantom-muted">{label}</p>
      <p className="font-mono text-2xl font-bold text-phantom-gold">{formatRemaining(remaining)}</p>
      {!inRegWindow && toRegClose <= 0 && status === "open" && (
        <p className="mt-1 text-xs text-phantom-danger">Registration closed — locking soon</p>
      )}
    </div>
  );
}
