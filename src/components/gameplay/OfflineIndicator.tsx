"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineIndicatorProps {
  /**
   * Whether the connection is offline
   */
  offline: boolean;

  /**
   * Callback when user clicks reconnect button
   */
  onReconnect?: () => void;

  /**
   * Optional custom message
   */
  message?: string;
}

export function OfflineIndicator({
  offline,
  onReconnect,
  message = "Connection Lost",
}: OfflineIndicatorProps) {
  const [showButton, setShowButton] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (offline) {
      // Show reconnect button after 3 failed auto-reconnect attempts
      const timer = setTimeout(() => setShowButton(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
      setAttemptCount(0);
    }
  }, [offline]);

  const handleReconnect = () => {
    setAttemptCount((prev) => prev + 1);
    onReconnect?.();
  };

  return (
    <AnimatePresence mode="wait">
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          style={{
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.95)",
              border: "1px solid rgba(239, 68, 68, 1)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Animated disconnection icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#fecaca",
                flexShrink: 0,
              }}
            />

            {/* Message text */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {message}
              </span>
              {showButton && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1,
                  }}
                >
                  Attempt {attemptCount} • {attemptCount > 3 ? "Check your connection" : "Auto-reconnecting..."}
                </span>
              )}
            </div>

            {/* Reconnect button */}
            {showButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReconnect}
                style={{
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.2)";
                }}
              >
                Reconnect
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
