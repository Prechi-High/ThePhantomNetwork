"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStealStore } from "@/stores/useStealStore";

/** Steal Ready overlay — Use Now / Save for Later */
export function StealReadyOverlay() {
  const { stealReady, stealSaved, setStealReady, saveStealForLater, useStealNow } = useStealStore();

  const visible = stealReady || stealSaved;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-3 px-6 py-4 rounded-xl"
          style={{
            background: "rgba(10,4,22,0.95)",
            border: "1px solid rgba(212,168,83,0.5)",
            boxShadow: "0 0 30px rgba(212,168,83,0.3)",
          }}
        >
          <span className="text-phantom-gold font-bold text-lg">⚔ Steal Ready</span>
          {stealSaved ? (
            <p className="text-sm text-phantom-muted">Steal saved — tap when ready</p>
          ) : (
            <div className="flex gap-3">
              <Button size="sm" onClick={useStealNow}>Use Now</Button>
              <Button size="sm" variant="secondary" onClick={saveStealForLater}>
                Save for Later
              </Button>
            </div>
          )}
          {stealSaved && (
            <Button size="sm" onClick={() => { setStealReady(true); useStealNow(); }}>
              Use Steal
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
