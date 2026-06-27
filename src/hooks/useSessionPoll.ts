"use client";

import { useEffect, useRef } from "react";

export function useSessionPoll(
  fetchFn: () => void | Promise<void>,
  intervalMs = 10000,
  enabled = true
) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    if (!enabled) return;
    fetchRef.current();
    const id = setInterval(() => fetchRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
