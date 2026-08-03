"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PopupKind = "token" | "influence" | "shield" | "session" | "funding";

const kindStyles: Record<PopupKind, string> = {
  token: "border-legacy-gold/40 text-legacy-gold",
  influence: "border-legacy-blue/40 text-legacy-blue",
  shield: "border-emerald-400/40 text-emerald-400",
  session: "border-legacy-amber/40 text-legacy-amber",
  funding: "border-legacy-emerald/40 text-legacy-emerald",
};

interface PopupToastProps {
  open: boolean;
  kind: PopupKind;
  title: string;
  subtitle?: string;
  onDismiss?: () => void;
}

export function PopupToast({ open, kind, title, subtitle, onDismiss }: PopupToastProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className={cn(
            "fixed top-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl border bg-legacy-card px-5 py-3 shadow-lg",
            kindStyles[kind]
          )}
          onAnimationComplete={() => {
            if (onDismiss) setTimeout(onDismiss, 2800);
          }}
        >
          <p className="text-sm font-bold">{title}</p>
          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
