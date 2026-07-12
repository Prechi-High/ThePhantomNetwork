"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RevivePanelProps {
  targetUsername: string;
  targetAvatar?: string;
  required: number;
  contributed: number;
  /** Who has contributed { userId, username, amount } */
  contributors?: Array<{ userId: string; username: string; amount: number }>;
  /** Seconds remaining before revive window expires */
  timeRemaining?: number;
  onContribute: (amount: number) => void;
  onClose?: () => void;
}

/** Animated token that travels from contributor area to revive bar */
function TravelingToken({ color, onDone }: { color: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: 0, y: -60, scale: 0.4, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute",
        width: 16, height: 16,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 12px ${color}`,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

export function RevivePanel({
  targetUsername,
  targetAvatar = "💀",
  required,
  contributed,
  contributors = [],
  timeRemaining = 30,
  onContribute,
  onClose,
}: RevivePanelProps) {
  const remaining   = Math.max(0, required - contributed);
  const fillPct     = Math.min(1, contributed / required);
  const isComplete  = fillPct >= 1;
  const [tokens, setTokens]   = useState<Array<{ id: number; color: string }>>([]);
  const [timeLeft, setTimeLeft] = useState(timeRemaining);
  const [failed, setFailed]   = useState(false);
  const tokenId = useState(0);

  // Countdown
  useEffect(() => {
    if (isComplete || failed) return;
    if (timeLeft <= 0) { setFailed(true); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, isComplete, failed]);

  // Emit token travel on contribute
  const handleContribute = (amount: number) => {
    if (remaining <= 0) return;
    onContribute(amount);

    const color = amount >= 3 ? "#f59e0b" : amount === 2 ? "#22c55e" : "#a855f7";
    const id = ++tokenId[0];
    setTokens(prev => [...prev, { id, color }]);
    setTimeout(() => setTokens(prev => prev.filter(t => t.id !== id)), 800);
  };

  const urgentTime = timeLeft <= 10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: failed
            ? "rgba(4,2,10,0.96)"
            : "rgba(4,2,10,0.9)",
          backdropFilter: "blur(16px)",
          zIndex: 85,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{
            scale: isComplete ? [1, 1.04, 1] : 1,
            y: 0,
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{
            width: "100%",
            maxWidth: 360,
            background: failed
              ? "linear-gradient(180deg,rgba(8,4,12,0.98),rgba(5,2,8,0.99))"
              : "linear-gradient(180deg,rgba(12,6,24,0.98),rgba(5,2,12,0.99))",
            borderRadius: 24,
            border: isComplete
              ? "1.5px solid rgba(251,191,36,0.6)"
              : failed
              ? "1.5px solid rgba(107,114,128,0.3)"
              : "1.5px solid rgba(34,197,94,0.3)",
            padding: "24px 20px 28px",
            boxShadow: isComplete
              ? "0 0 40px rgba(251,191,36,0.25)"
              : failed
              ? "none"
              : `0 0 30px rgba(34,197,94,0.15)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* ── Success burst ── */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.8 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 24,
                  background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Heartbeat effect ── */}
          {!isComplete && !failed && (
            <motion.div
              animate={{ opacity: [0, 0.12, 0] }}
              transition={{ duration: urgentTime ? 0.6 : 1.2, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(34,197,94,0.08)",
                borderRadius: 24,
                pointerEvents: "none",
              }}
            />
          )}

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {/* Avatar */}
            <motion.div
              animate={!isComplete && !failed ? { scale: [1, 1.06, 1] } : undefined}
              transition={{ duration: urgentTime ? 0.6 : 1.2, repeat: Infinity }}
              style={{
                width: 64, height: 64, borderRadius: 20,
                background: failed
                  ? "rgba(20,10,30,0.9)"
                  : "linear-gradient(135deg,rgba(49,7,70,0.8),rgba(15,0,30,0.9))",
                border: failed
                  ? "1.5px solid rgba(107,114,128,0.3)"
                  : isComplete
                  ? "2px solid #fbbf24"
                  : "1.5px solid rgba(34,197,94,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 12px",
                boxShadow: isComplete
                  ? "0 0 20px rgba(251,191,36,0.4)"
                  : failed
                  ? "none"
                  : "0 0 15px rgba(34,197,94,0.2)",
                filter: failed ? "grayscale(80%)" : "none",
                opacity: failed ? 0.6 : 1,
              }}
            >
              {targetAvatar}
            </motion.div>

            {isComplete ? (
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.6)", marginBottom: 3 }}>
                  ✦ REVIVED ✦
                </div>
                <div style={{ fontSize: 12, color: "rgba(251,191,36,0.7)", fontWeight: 700 }}>
                  {targetUsername} is back
                </div>
              </div>
            ) : failed ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(107,114,128,0.8)", marginBottom: 3 }}>
                  {targetUsername}
                </div>
                <div style={{ fontSize: 11, color: "rgba(107,114,128,0.5)", fontWeight: 600 }}>
                  Revive window closed
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10, color: "rgba(34,197,94,0.6)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
                  REVIVE
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                  {targetUsername}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                  is depending on your squad
                </div>
              </div>
            )}
          </div>

          {/* ── Revive progress bar ── */}
          {!failed && (
            <div style={{ marginBottom: 16, position: "relative" }}>
              {/* Token travel container */}
              <div style={{ position: "relative", height: 0 }}>
                {tokens.map(t => (
                  <TravelingToken key={t.id} color={t.color} onDone={() => {}} />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(34,197,94,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  PROGRESS
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
                    {contributed}/{required}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: remaining > 0 ? "rgba(239,68,68,0.8)" : "#22c55e" }}>
                    {remaining > 0 ? `${remaining} needed` : "COMPLETE"}
                  </span>
                </div>
              </div>

              <div style={{ height: 10, borderRadius: 9999, overflow: "hidden", background: "rgba(20,10,30,0.6)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <motion.div
                  animate={{ width: `${fillPct * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    background: isComplete
                      ? "linear-gradient(90deg,#22c55e,#fbbf24)"
                      : "linear-gradient(90deg,#166534,#22c55e)",
                    boxShadow: isComplete ? "0 0 12px rgba(251,191,36,0.6)" : "0 0 8px rgba(34,197,94,0.5)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Contributors ── */}
          {contributors.length > 0 && !failed && (
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {contributors.map(c => (
                <div key={c.userId} style={{ padding: "2px 8px", borderRadius: 9999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e" }}>{c.username}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fbbf24" }}>+{c.amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Countdown ── */}
          {!isComplete && !failed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: urgentTime ? 0.4 : 1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: urgentTime ? "#ef4444" : "#22c55e", boxShadow: `0 0 6px ${urgentTime ? "#ef4444" : "#22c55e"}` }}
              />
              <span style={{ fontSize: 11, fontWeight: 800, color: urgentTime ? "#ef4444" : "rgba(34,197,94,0.7)", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" }}>
                {timeLeft}s REMAINING
              </span>
            </div>
          )}

          {/* ── Contribution buttons ── */}
          {!isComplete && !failed && (
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3].map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={remaining > 0 ? { scale: 1.05, y: -2 } : undefined}
                  whileTap={remaining > 0 ? { scale: 0.95 } : undefined}
                  onClick={() => handleContribute(amount)}
                  disabled={remaining <= 0}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: remaining > 0
                      ? amount === 3
                        ? "1.5px solid rgba(251,191,36,0.5)"
                        : amount === 2
                        ? "1.5px solid rgba(34,197,94,0.5)"
                        : "1.5px solid rgba(168,85,247,0.5)"
                      : "1px solid rgba(107,114,128,0.2)",
                    background: remaining > 0
                      ? amount === 3
                        ? "rgba(251,191,36,0.1)"
                        : amount === 2
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(168,85,247,0.1)"
                      : "rgba(17,17,17,0.4)",
                    cursor: remaining > 0 ? "pointer" : "not-allowed",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 900, color: remaining > 0 ? (amount === 3 ? "#fbbf24" : amount === 2 ? "#22c55e" : "#c084fc") : "rgba(107,114,128,0.4)", lineHeight: 1 }}>
                    +{amount}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
                    TOKEN{amount > 1 ? "S" : ""}
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* ── Close / Dismiss ── */}
          {(isComplete || failed) && onClose && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "12px 0",
                borderRadius: 12,
                border: "1px solid rgba(168,85,247,0.25)",
                background: "rgba(88,28,135,0.1)",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(168,85,247,0.7)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {isComplete ? "CONTINUE" : "DISMISS"}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
