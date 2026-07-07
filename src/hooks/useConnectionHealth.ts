"use client";

import { useEffect, useState, useCallback } from "react";

interface ConnectionHealthOptions {
  /**
   * Interval to check connection health (ms)
   */
  checkInterval?: number;

  /**
   * Number of failed checks before marking offline
   */
  failureThreshold?: number;

  /**
   * Timeout for health check request (ms)
   */
  requestTimeout?: number;

  /**
   * Callback when connection status changes
   */
  onStatusChange?: (online: boolean) => void;
}

/**
 * Monitors connection health and detects offline state
 * Uses periodic server-time requests to detect network issues
 */
export function useConnectionHealth({
  checkInterval = 5000, // 5 seconds
  failureThreshold = 3, // 3 failed checks = offline
  requestTimeout = 3000, // 3 second timeout
  onStatusChange,
}: ConnectionHealthOptions = {}) {
  const [online, setOnline] = useState(true);
  const [failureCount, setFailureCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  const checkConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch("/api/server-time", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Connection successful
        if (!online) {
          setOnline(true);
          onStatusChange?.(true);
        }
        setFailureCount(0);
        setLastCheckTime(Date.now());
      } else {
        // Server error
        const newFailureCount = failureCount + 1;
        setFailureCount(newFailureCount);

        if (newFailureCount >= failureThreshold && online) {
          setOnline(false);
          onStatusChange?.(false);
        }
      }
    } catch (error) {
      // Network error
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);

      if (newFailureCount >= failureThreshold && online) {
        setOnline(false);
        onStatusChange?.(false);
      }
    }
  }, [online, failureCount, failureThreshold, requestTimeout, onStatusChange]);

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(checkConnection, checkInterval);
    return () => clearInterval(interval);
  }, [checkConnection, checkInterval]);

  // Listen for browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setFailureCount(0);
      onStatusChange?.(true);
      // Immediate check when coming online
      checkConnection();
    };

    const handleOffline = () => {
      setOnline(false);
      onStatusChange?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection, onStatusChange]);

  return {
    online,
    failureCount,
    lastCheckTime,
    checkConnection, // Expose for manual reconnect
  };
}
