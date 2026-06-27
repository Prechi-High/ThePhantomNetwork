"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NetworkPlayer {
  userId: string;
  username: string;
  avatarId?: string | null;
  squadId?: string | null;
}

interface PhantomNetworkIntroProps {
  visible: boolean;
  players: NetworkPlayer[];
  phase?: number;
  onComplete: () => void;
  durationMs?: number;
}

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const hues = [210, 45, 280, 160, 0];
  return hues[Math.abs(hash) % hues.length];
}

export function PhantomNetworkIntro({
  visible,
  players,
  phase,
  onComplete,
  durationMs = 5000,
}: PhantomNetworkIntroProps) {
  const [progress, setProgress] = useState(0);

  const nodes = useMemo(() => {
    const list = players.length
      ? players
      : Array.from({ length: 12 }, (_, i) => ({
          userId: `ghost-${i}`,
          username: `Player ${i + 1}`,
          squadId: `squad-${i % 4}`,
        }));

    const squads = new Map<string, NetworkPlayer[]>();
    for (const p of list) {
      const key = p.squadId ?? p.userId;
      if (!squads.has(key)) squads.set(key, []);
      squads.get(key)!.push(p);
    }

    const squadGroups = [...squads.values()].slice(0, 6);
    const positioned: { x: number; y: number; player: NetworkPlayer; squadIdx: number }[] = [];

    squadGroups.forEach((group, squadIdx) => {
      const baseAngle = (squadIdx / squadGroups.length) * Math.PI * 2;
      const cx = 50 + Math.cos(baseAngle) * 28;
      const cy = 42 + Math.sin(baseAngle) * 22;
      group.slice(0, 3).forEach((player, i) => {
        const offset = (i - 1) * 8;
        positioned.push({
          x: cx + offset,
          y: cy + (i === 1 ? -4 : 4),
          player,
          squadIdx,
        });
      });
    });

    return positioned;
  }, [players]);

  const edges = useMemo(() => {
    const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].squadIdx !== nodes[j].squadIdx) {
          links.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
          });
        }
      }
    }
    return links.slice(0, 24);
  }, [nodes]);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / durationMs);
      setProgress(p);
      if (p >= 1) onComplete();
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [visible, durationMs, onComplete]);

  const title = phase && phase > 0 ? `PHASE ${phase}` : "THE PHANTOM";
  const subtitle =
    phase && phase > 0
      ? "Connecting to the network..."
      : "PREPARING SESSION";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-phantom-bg"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a1a2e_0%,_#0a0a0f_70%)]" />

          <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
            <div className="relative h-[min(52vh,420px)] w-full max-w-lg">
              <svg
                viewBox="0 0 100 80"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {edges.map((e, i) => (
                  <motion.line
                    key={i}
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    stroke="rgba(212,168,83,0.25)"
                    strokeWidth="0.15"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: i * 0.05, duration: 0.8 }}
                  />
                ))}
                {nodes.map((n, i) => (
                  <motion.g
                    key={n.player.userId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="2.2"
                      fill={`hsl(${avatarColor(n.player.userId)}, 60%, 55%)`}
                      stroke="rgba(212,168,83,0.5)"
                      strokeWidth="0.2"
                    />
                  </motion.g>
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-4">
                {[...new Map(nodes.map((n) => [n.squadIdx, n])).values()]
                  .slice(0, 3)
                  .map((n, i) => (
                    <motion.div
                      key={n.squadIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className="w-[30%] min-w-[90px] rounded-lg border border-phantom-gold/30 bg-phantom-surface/80 p-2 backdrop-blur-sm"
                    >
                      <div
                        className="mx-auto mb-1 h-8 w-8 rounded-full border border-phantom-gold/40"
                        style={{
                          background: `hsl(${avatarColor(String(n.squadIdx))}, 50%, 35%)`,
                        }}
                      />
                      <p className="truncate text-center text-[9px] font-bold uppercase tracking-wide text-phantom-gold">
                        {n.player.username.replace("@", "")}
                      </p>
                      <div className="mt-1 h-0.5 overflow-hidden rounded bg-phantom-border">
                        <motion.div
                          className="h-full bg-phantom-gold"
                          animate={{ width: `${30 + (i + 1) * 20}%` }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-phantom-gold/30 border-t-phantom-gold" />
              <h2 className="font-display text-xl font-bold tracking-widest text-phantom-gold sm:text-2xl">
                {subtitle}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-phantom-muted">
                {title} · {players.length || "many"} connected
              </p>
              <p className="mt-2 text-[10px] text-phantom-muted/70">
                Darkness is the foundation
              </p>
            </motion.div>
          </div>

          <div className="relative px-6 pb-8">
            <div className="mx-auto h-1 max-w-xs overflow-hidden rounded-full bg-phantom-border">
              <motion.div
                className="h-full bg-phantom-gold"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-phantom-muted">
              Estimated start: {Math.ceil((1 - progress) * (durationMs / 1000))}s
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
