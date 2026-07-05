"use client";

import { motion } from "framer-motion";

interface SpinButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  isSpinning?: boolean;
}

export function SpinButton({ disabled, onClick, isSpinning }: SpinButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className="relative focus:outline-none"
      style={{
        width: "148px",
        height: "148px",
        borderRadius: "50%",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          inset: "-16px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(245,158,11,0.4) 0%,rgba(245,158,11,0) 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Outermost metallic gold rim */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg,#b45309,#fcd34d,#f59e0b,#d97706,#b45309,#fcd34d,#f59e0b,#b45309)",
          boxShadow:
            "0 0 30px rgba(245,158,11,0.7), 0 0 60px rgba(245,158,11,0.3), inset 0 2px 0 rgba(255,255,255,0.25)",
          padding: "4px",
        }}
      />

      {/* Inner body */}
      <div
        className="absolute rounded-full flex flex-col items-center justify-center"
        style={{
          inset: "4px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 30%,#a16207 0%,#78350f 40%,#3f1c05 80%,#1c0a01 100%)",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6), inset 0 -2px 8px rgba(245,158,11,0.2)",
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "8px",
            borderRadius: "50%",
            border: "1px solid rgba(245,158,11,0.25)",
            pointerEvents: "none",
          }}
        />

        {/* Specular top highlight */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "20px",
            background:
              "radial-gradient(ellipse,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0) 100%)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />

        {/* SPIN label */}
        <span
          style={{
            fontSize: "26px",
            fontWeight: 900,
            color: "#fcd34d",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1,
            textShadow:
              "0 0 12px rgba(252,211,77,0.8), 0 2px 4px rgba(0,0,0,0.6)",
            fontFamily: "system-ui,sans-serif",
          }}
        >
          SPIN
        </span>

        {/* HOLD FOR AUTO label */}
        <span
          style={{
            fontSize: "8.5px",
            fontWeight: 700,
            color: "rgba(252,211,77,0.6)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: "3px",
            lineHeight: 1,
          }}
        >
          HOLD FOR AUTO
        </span>
      </div>
    </motion.button>
  );
}
