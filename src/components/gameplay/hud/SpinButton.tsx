"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ButtonAnimator } from "@/components/gameplay/premium-wheel";

type ButtonState =
  | "disabled"
  | "ready"
  | "charging"
  | "locked"
  | "cooldown"
  | "warning"
  | "network_wait";

interface SpinButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  isSpinning?: boolean;
  /** Explicit state override — inferred from disabled/isSpinning if not provided */
  buttonState?: ButtonState;
  /** Remaining cooldown ms for cooldown state */
  cooldownMs?: number;
  /** Warning message for warning state */
  warningMessage?: string;
}

function deriveState(
  disabled?: boolean,
  isSpinning?: boolean,
  explicit?: ButtonState,
): ButtonState {
  if (explicit) return explicit;
  if (isSpinning) return "locked";
  if (disabled)   return "disabled";
  return "ready";
}

const STATE_LABELS: Record<ButtonState, string> = {
  disabled:     "DISABLED",
  ready:        "ENGAGE",
  charging:     "CHARGING",
  locked:       "LOCKED",
  cooldown:     "WAIT",
  warning:      "WARNING",
  network_wait: "CONNECTING",
};

export function SpinButton({
  disabled,
  onClick,
  isSpinning,
  buttonState: explicit,
  cooldownMs,
  warningMessage,
}: SpinButtonProps) {
  const state = deriveState(disabled, isSpinning, explicit);

  const isInteractable = state === "ready";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(3px, 0.4vw, 5px)", position: "relative" }}>

      {/* Warning banner above button */}
      <AnimatePresence>
        {state === "warning" && warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 8,
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.5)",
              borderRadius: 8,
              padding: "4px 10px",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#f59e0b" }}>
              ⚠ {warningMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network waiting indicator */}
      <AnimatePresence>
        {state === "network_wait" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              border: "2px solid rgba(59,130,246,0.5)",
              borderTopColor: "#3b82f6",
            }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* Core button — delegates to premium ButtonAnimator */}
      <ButtonAnimator
        disabled={!isInteractable}
        isSpinning={state === "locked" || state === "charging"}
        onClick={isInteractable ? onClick : undefined}
      />

      {/* State label */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        {/* Cooldown countdown */}
        {state === "cooldown" && cooldownMs && cooldownMs > 0 && (
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
            {Math.ceil(cooldownMs / 1000)}s
          </span>
        )}
        <span
          style={{
            fontSize: "var(--text-2xs)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: state === "ready"
              ? "rgba(212,168,83,0.6)"
              : state === "warning"
              ? "rgba(245,158,11,0.8)"
              : state === "locked" || state === "charging"
              ? "rgba(168,85,247,0.6)"
              : "rgba(255,255,255,0.3)",
          }}
        >
          {STATE_LABELS[state]}
        </span>
      </motion.div>
    </div>
  );
}
