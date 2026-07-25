"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { getAssetDisplayName } from "@/lib/brand/terminology";
import type { StealTarget } from "@/types/gameplay";
import type { TacticalAssetSlug } from "@/types/gameplay";

interface TargetSelectionModalProps {
  open: boolean;
  assetSlug: TacticalAssetSlug | null;
  targets: StealTarget[];
  onSelect: (targetId: string) => void;
  onClose: () => void;
}

/** Target selection for Intercept, Disrupt, Mark, and Steal */
export function TargetSelectionModal({
  open,
  assetSlug,
  targets,
  onSelect,
  onClose,
}: TargetSelectionModalProps) {
  const title = assetSlug ? getAssetDisplayName(assetSlug) : "Select Target";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            className="w-full max-w-md rounded-xl bg-phantom-bg-elevated border border-phantom-border p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <p className="text-xs text-phantom-muted">Recommended targets</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {targets.map((t) => (
                <button
                  key={t.userId}
                  type="button"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-phantom-surface hover:bg-phantom-surface-hover border border-phantom-border-subtle text-left"
                  onClick={() => onSelect(t.userId)}
                >
                  <div>
                    <p className="font-medium">{t.username}</p>
                    <p className="text-xs text-phantom-muted">{t.reason}</p>
                  </div>
                  <div className="text-right">
                    {t.rank != null && <p className="text-xs text-phantom-purple">Rank {t.rank}</p>}
                    <p className="text-sm font-bold">{t.tokens} tokens</p>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={onClose}>Cancel</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
